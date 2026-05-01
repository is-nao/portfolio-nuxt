FROM node:24-trixie-slim

ARG TZ
ENV TZ="$TZ"

# Install basic development tools and iptables/ipset
RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates \
  openssh-client \
  gnupg2 \
  procps \
  man-db \
  zsh \
  curl \
  sudo \
  git \
  gh \
  vim \
  less \
  unzip \
  fzf \
  jq \
  yq \
  python3 \
  libglib2.0-0t64 \
  libnspr4 \
  libnss3 \
  libatk1.0-0t64 \
  libatk-bridge2.0-0t64 \
  libdbus-1-3 \
  libcups2t64 \
  libxcb1 \
  libxkbcommon0 \
  libasound2t64 \
  libgbm1 \
  libx11-6 \
  libxext6 \
  libcairo2 \
  libpango-1.0-0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libatspi2.0-0t64 \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Ensure default node user has access to /usr/local/share
RUN chown -R node:node /usr/local/share

# Set up shell history volume directory
RUN mkdir /commandhistory \
  && touch /commandhistory/.bash_history \
  && chown -R node /commandhistory

# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=true

# Create workspace and config directories and set permissions
RUN mkdir -p /workspace /home/node/.claude /home/node/.cache/ms-playwright && \
  chown -R node:node /workspace /home/node/.claude /home/node/.cache

WORKDIR /workspace

ARG GIT_DELTA_VERSION
RUN ARCH=$(dpkg --print-architecture) && \
  curl -fsSLO "https://github.com/dandavison/delta/releases/download/${GIT_DELTA_VERSION}/git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  dpkg -i "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb" && \
  rm "git-delta_${GIT_DELTA_VERSION}_${ARCH}.deb"

# Set up zsh with robbyrussell theme and plugins (run as root with HOME=/home/node)
ARG ZSH_IN_DOCKER_VERSION
RUN HOME=/home/node sh -c "$(curl -fsSL https://github.com/deluan/zsh-in-docker/releases/download/v${ZSH_IN_DOCKER_VERSION}/zsh-in-docker.sh)" -- \
  -t robbyrussell \
  -p fzf \
  -p https://github.com/zsh-users/zsh-autosuggestions \
  -p https://github.com/zsh-users/zsh-completions \
  -a "export PROMPT_COMMAND='history -a' && export HISTFILE=/commandhistory/.bash_history" && \
  chown -R node:node /home/node

# Install pnpm globally (as root, before USER node)
ENV PNPM_HOME="/home/node/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm

# Set the default shell to zsh
ENV SHELL=/bin/zsh
ENV EDITOR=vim
ENV VISUAL=vim

# Install Claude Code as node user
USER node
RUN curl -fsSL https://claude.ai/install.sh | bash
ENV PATH="/home/node/.local/bin:$PATH"

# Install uv and Serena
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
RUN uv tool install -p 3.13 serena-agent@latest --prerelease=allow
RUN serena init
