# 🚀 GoDaddy Deployment Guide

## 🔄 Automatic Deployment from GitHub

### **Setup Steps:**

#### **1. Get GoDaddy FTP Credentials**

1. Login to GoDaddy hosting control panel
2. Go to "FTP Management" or "File Manager"
3. Note down:
   - FTP Server (e.g., `ftp.yourdomain.com`)
   - FTP Username
   - FTP Password
   - Server directory (usually `public_html/`)

#### **2. Add GitHub Secrets**

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Add these repository secrets:
   - `FTP_SERVER`: Your GoDaddy FTP server
   - `FTP_USERNAME`: Your FTP username
   - `FTP_PASSWORD`: Your FTP password

#### **3. How It Works**

- **Push to main branch** → GitHub Actions automatically triggers
- **Website deploys** to GoDaddy via FTP
- **Live site updates** automatically
- **No manual uploads** needed

### **Workflow Benefits:**

✅ **Automatic Updates**: Push code → Website updates automatically
✅ **Version Control**: Track all changes in Git
✅ **Rollback Easy**: Revert to previous versions instantly
✅ **Team Collaboration**: Multiple people can contribute
✅ **Professional Process**: Industry-standard deployment

### **Manual Deployment (Alternative):**

If you prefer manual control:

1. Upload files via GoDaddy File Manager
2. Use FTP client for bulk uploads
3. Update files individually as needed

### **Testing:**

- Test locally first: `python3 -m http.server 8000`
- Push to GitHub for automatic deployment
- Check live website for changes
- Monitor GitHub Actions for deployment status

## 🎯 **Recommended Workflow:**

1. **Make changes** locally
2. **Test** on local server
3. **Commit & push** to GitHub
4. **GitHub Actions** automatically deploys to GoDaddy
5. **Website updates** live in minutes

## 🔧 **Troubleshooting:**

- Check GitHub Actions logs for errors
- Verify FTP credentials are correct
- Ensure GoDaddy hosting supports FTP
- Check file permissions on server
