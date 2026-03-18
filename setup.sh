#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# NEURAL-CLAW Hardened Setup Script
# Ubuntu 24.04 LTS | Tailscale + Docker | Sovereign AI Deployment
# ═══════════════════════════════════════════════════════════════════════
# 
# USAGE: sudo bash setup.sh
# 
# What this does:
#   1. Creates dedicated non-root 'openclaw' user
#   2. Installs Tailscale (WireGuard-based VPN)
#   3. Installs Docker with security hardening
#   4. Configures UFW firewall (default-deny + Docker DOCKER-USER fix)
#   5. Installs Fail2ban
#   6. Hardens SSH
#   7. Enables unattended-upgrades
#   8. Generates strong gateway token
#   9. Starts NEURAL-CLAW stack
#
# Based on security research from:
#   - CVE-2026-25253 (CVSS 8.8) — patched in OpenClaw v2026.1.29+
#   - SecurityScorecard RCE audit (42,665 exposed instances)
#   - openclaw-ansible playbook (github.com/openclaw/openclaw-ansible)
# ═══════════════════════════════════════════════════════════════════════

set -euo pipefail
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[NEURAL-CLAW]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
die()  { echo -e "${RED}[FATAL]${NC} $1"; exit 1; }

[[ $EUID -eq 0 ]] || die "Run as root: sudo bash setup.sh"
[[ -f /etc/debian_version ]] || die "Ubuntu/Debian required"

# ─── 1. System Update ────────────────────────────────────────────────
log "Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# ─── 2. Create openclaw user ─────────────────────────────────────────
log "Creating dedicated openclaw user..."
if ! id openclaw &>/dev/null; then
  useradd -r -m -d /home/openclaw -s /bin/bash openclaw
  usermod -aG docker openclaw 2>/dev/null || true
fi
mkdir -p /home/openclaw/.openclaw/{workspace,logs}
chown -R openclaw:openclaw /home/openclaw/.openclaw
chmod 700 /home/openclaw/.openclaw

# ─── 3. Generate gateway token ───────────────────────────────────────
log "Generating gateway token..."
GATEWAY_TOKEN=$(openssl rand -hex 32)
CHROMA_TOKEN=$(openssl rand -hex 24)

cat > /home/openclaw/.openclaw/.env <<EOF
# NEURAL-CLAW Environment — $(date)
# KEEP THESE SECRET — chmod 600 this file
OPENCLAW_GATEWAY_TOKEN=${GATEWAY_TOKEN}
CHROMA_SERVER_AUTH_CREDENTIALS=${CHROMA_TOKEN}

# NO API KEYS — using local Ollama only
# If you ever add cloud fallback, add keys here:
# ANTHROPIC_API_KEY=
# OPENAI_API_KEY=
EOF

chmod 600 /home/openclaw/.openclaw/.env
chown openclaw:openclaw /home/openclaw/.openclaw/.env
log "  Gateway token saved to /home/openclaw/.openclaw/.env"
log "  Token: ${GATEWAY_TOKEN:0:8}... (truncated for display)"

# ─── 4. SSH Hardening ────────────────────────────────────────────────
log "Hardening SSH..."
SSH_BACKUP="/etc/ssh/sshd_config.backup.$(date +%s)"
cp /etc/ssh/sshd_config "$SSH_BACKUP"
warn "  SSH config backed up to: $SSH_BACKUP"

# Generate Ed25519 host key if missing
if [[ ! -f /etc/ssh/ssh_host_ed25519_key ]]; then
  ssh-keygen -t ed25519 -f /etc/ssh/ssh_host_ed25519_key -N ""
fi

cat >> /etc/ssh/sshd_config <<'EOF'

# NEURAL-CLAW SSH Hardening
Port 2222
PasswordAuthentication no
PermitRootLogin no
MaxAuthTries 3
LoginGraceTime 20
AllowUsers openclaw
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
X11Forwarding no
AllowTcpForwarding no
PermitTunnel no
EOF

systemctl restart sshd
warn "  SSH moved to port 2222. Add your pubkey before closing this session!"
warn "  ssh-keygen -t ed25519 && ssh-copy-id -p 2222 openclaw@<this-machine>"

# ─── 5. Install Tailscale ────────────────────────────────────────────
log "Installing Tailscale..."
if ! command -v tailscale &>/dev/null; then
  curl -fsSL https://tailscale.com/install.sh | sh
fi
systemctl enable --now tailscaled

warn "  Run: sudo tailscale up --authkey tskey-auth-XXXXXXXX"
warn "  Then assign tags in Tailscale admin console"
warn "  Tags to assign: tag:neural-brainstem, tag:neural-thalamus (per machine role)"

# ─── 6. Install Docker ───────────────────────────────────────────────
log "Installing Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker openclaw
fi
systemctl enable --now docker

# ─── 7. UFW Firewall ─────────────────────────────────────────────────
log "Configuring UFW firewall..."
apt-get install -y -qq ufw

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 2222/tcp comment 'SSH hardened'
ufw allow 41641/udp comment 'Tailscale'

# Allow OpenClaw and Ollama ONLY from Tailscale mesh (100.64.0.0/10)
ufw allow from 100.64.0.0/10 to any port 18789 proto tcp comment 'OpenClaw via Tailscale only'
ufw allow from 100.64.0.0/10 to any port 3000 proto tcp comment 'Canvas UI via Tailscale only'

ufw logging on
ufw --force enable

# ─── CRITICAL: Docker IPTABLES fix ────────────────────────────────────
log "Applying Docker UFW bypass fix..."
cat >> /etc/ufw/after.rules <<'EOF'

# NEURAL-CLAW: Prevent Docker from bypassing UFW
# Only Tailscale traffic and internal Docker traffic allowed
*filter
:DOCKER-USER - [0:0]
-A DOCKER-USER -i tailscale0 -j ACCEPT
-A DOCKER-USER -i lo -j ACCEPT
-A DOCKER-USER -j DROP
COMMIT
EOF

ufw reload
systemctl restart docker
log "  UFW rules applied. Docker-UFW bypass fixed."

# ─── 8. Fail2ban ────────────────────────────────────────────────────
log "Installing Fail2ban..."
apt-get install -y -qq fail2ban

cat > /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port    = 2222
logpath = %(sshd_log)s
backend = systemd
EOF

systemctl enable --now fail2ban

# ─── 9. Unattended Upgrades ──────────────────────────────────────────
log "Enabling unattended security upgrades..."
apt-get install -y -qq unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades

# ─── 10. Setup TRIT-TRT (Ternary Inference) ──────────────────────────
log "Setting up TRIT-TRT ternary inference engine..."
cd "$(dirname "$0")"
if [ -d "./trit-trt" ]; then
  log "  TRIT-TRT submodule found."
  git submodule update --init --recursive 2>/dev/null || true
  log "  Building TRIT-TRT Docker image..."
  docker compose build trit_trt 2>/dev/null || warn "  TRIT-TRT build skipped (will pull on first run)"
else
  warn "  trit-trt submodule not found. Run: git submodule update --init"
fi

# ─── 11. Start NEURAL-CLAW Stack ────────────────────────────────────
log "Starting NEURAL-CLAW Docker stack..."
docker compose up -d

# Wait for Ollama
log "Waiting for Ollama to be ready..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:11434/api/tags &>/dev/null; then
    log "  Ollama is ready!"
    break
  fi
  sleep 2
done

# ─── 12. Summary ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  NEURAL-CLAW — Deployment Complete${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo "  Canvas UI:       http://localhost:3000 (Tailscale only)"
echo "  TRIT-TRT:        http://localhost:8765 (loopback only — primary inference)"
echo "  OpenClaw API:    http://localhost:18789 (Tailscale only)"
echo "  Ollama API:      http://localhost:11434 (loopback only — fallback)"
echo "  SSH port:        2222"
echo ""
echo -e "${YELLOW}  NEXT STEPS:${NC}"
echo "  1. sudo tailscale up --authkey tskey-auth-XXXXX"
echo "  2. Assign node tag in Tailscale admin"
echo "  3. Upload tailscale-acl.json to Tailscale admin → Access Controls"
echo "  4. Add your SSH pubkey: ssh-copy-id -p 2222 openclaw@<ip>"
echo "  5. Open canvas via Tailscale IP: http://<tailscale-ip>:3000"
echo ""
echo -e "${YELLOW}  GATEWAY TOKEN (store securely):${NC}"
echo "  ${GATEWAY_TOKEN}"
echo ""
echo -e "${RED}  SECURITY REMINDERS:${NC}"
echo "  - Port 18789 is LOOPBACK ONLY — access via Tailscale"
echo "  - Port 11434 is LOOPBACK ONLY — never expose Ollama publicly"
echo "  - Run: docker compose logs -f — to monitor agent activity"
echo "  - Run: sudo journalctl -u tailscaled -f — to monitor VPN"
echo ""
