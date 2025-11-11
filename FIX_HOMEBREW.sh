#!/bin/bash

# Fix Homebrew permissions - Complete command
sudo chown -R $(whoami) /opt/homebrew /opt/homebrew/etc/bash_completion.d /opt/homebrew/lib/pkgconfig /opt/homebrew/share/aclocal /opt/homebrew/share/doc /opt/homebrew/share/info /opt/homebrew/share/locale /opt/homebrew/share/man /opt/homebrew/share/man/man1 /opt/homebrew/share/man/man3 /opt/homebrew/share/man/man5 /opt/homebrew/share/man/man7 /opt/homebrew/share/man/man8 /opt/homebrew/share/zsh /opt/homebrew/share/zsh/site-functions /opt/homebrew/var/homebrew/locks /opt/homebrew/var/log

# Set write permissions
chmod u+w /opt/homebrew /opt/homebrew/etc/bash_completion.d /opt/homebrew/lib/pkgconfig /opt/homebrew/share/aclocal /opt/homebrew/share/doc /opt/homebrew/share/info /opt/homebrew/share/locale /opt/homebrew/share/man /opt/homebrew/share/man/man1 /opt/homebrew/share/man/man3 /opt/homebrew/share/man/man5 /opt/homebrew/share/man/man7 /opt/homebrew/share/man/man8 /opt/homebrew/share/zsh /opt/homebrew/share/zsh/site-functions /opt/homebrew/var/homebrew/locks /opt/homebrew/var/log

echo "✅ Permissions fixed! Now run: brew install maven"
