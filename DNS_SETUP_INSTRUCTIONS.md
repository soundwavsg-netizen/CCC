# DNS Configuration Guide for project62@cccdigital.sg

## Why DNS Configuration is Needed

To send emails from `project62@cccdigital.sg`, you need to prove to email providers (Gmail, Outlook, etc.) that you own the domain `cccdigital.sg`. This is done by adding special DNS records that SendGrid provides.

---

## Step-by-Step Instructions

### **Step 1: Get DNS Records from SendGrid**

1. **Go to SendGrid Dashboard**
   - URL: https://app.sendgrid.com/
   - Login with: `project62sg@gmail.com` (your SendGrid account)

2. **Navigate to Domain Authentication**
   - Click **Settings** (left sidebar)
   - Click **Sender Authentication**
   - Click **Authenticate Your Domain** button

3. **Start Domain Setup**
   - Select your DNS host from the dropdown (e.g., GoDaddy, Namecheap, Cloudflare, etc.)
   - If you don't know: Select "Other Host (Not Listed)"
   - Click **Next**

4. **Enter Your Domain**
   - Enter: `cccdigital.sg`
   - Make sure "Would you also like to brand the links for this domain?" is CHECKED
   - Click **Next**

5. **Copy DNS Records**
   SendGrid will now show you 3 DNS records that look like this:

   ```
   Type: CNAME
   Host: em1234.cccdigital.sg
   Value: u1234567.wl123.sendgrid.net
   
   Type: CNAME
   Host: s1._domainkey.cccdigital.sg
   Value: s1.domainkey.u1234567.wl123.sendgrid.net
   
   Type: CNAME
   Host: s2._domainkey.cccdigital.sg
   Value: s2.domainkey.u1234567.wl123.sendgrid.net
   ```

   **IMPORTANT:** Keep this page open! You'll need these exact values.

---

### **Step 2: Add DNS Records to Your Domain Provider**

Now you need to add these 3 records to wherever you manage the `cccdigital.sg` domain.

#### **Common DNS Providers:**

**If using GoDaddy:**
1. Login to GoDaddy.com
2. Go to "My Products" → "Domains"
3. Find `cccdigital.sg` and click "DNS"
4. Click "Add" button
5. For each of the 3 records:
   - Type: Select "CNAME"
   - Host: Enter the "Host" value from SendGrid (e.g., `em1234`)
   - Points to: Enter the "Value" from SendGrid
   - TTL: 1 Hour (default)
   - Click "Save"

**If using Namecheap:**
1. Login to Namecheap.com
2. Go to Domain List → Manage for `cccdigital.sg`
3. Click "Advanced DNS" tab
4. Click "Add New Record"
5. For each of the 3 records:
   - Type: CNAME Record
   - Host: Enter the "Host" value from SendGrid
   - Value: Enter the "Value" from SendGrid
   - TTL: Automatic
   - Click "Save All Changes"

**If using Cloudflare:**
1. Login to Cloudflare.com
2. Select `cccdigital.sg` domain
3. Click "DNS" tab
4. Click "Add record"
5. For each of the 3 records:
   - Type: CNAME
   - Name: Enter the "Host" value from SendGrid
   - Target: Enter the "Value" from SendGrid
   - Proxy status: DNS only (grey cloud)
   - Click "Save"

**If using Route53 (AWS):**
1. Login to AWS Console
2. Go to Route53 → Hosted Zones
3. Click on `cccdigital.sg`
4. Click "Create record"
5. For each of the 3 records:
   - Record type: CNAME
   - Record name: Enter the "Host" value from SendGrid
   - Value: Enter the "Value" from SendGrid
   - TTL: 300
   - Click "Create records"

---

### **Step 3: Verify in SendGrid**

1. **Go back to SendGrid page** (the one with the 3 DNS records)
2. Check the box: "I've added these records"
3. Click **Verify** button
4. Wait for verification...

**Verification Time:**
- Usually takes: 5-15 minutes
- Can take up to: 48 hours (rare)
- You'll see: "Your domain has been verified" message when done

**If verification fails:**
- Wait 15-30 minutes and try again
- Double-check you entered the records exactly as shown
- Make sure there are no extra spaces or characters
- Contact your DNS provider support if needed

---

### **Step 4: Add Sender Identity (After Domain is Verified)**

1. **In SendGrid Dashboard:**
   - Go to: Settings → Sender Authentication
   - Click **Single Sender Verification**
   - Click **Create New Sender** button

2. **Fill in the form:**
   - From Name: `Project 62`
   - From Email Address: `project62@cccdigital.sg`
   - Reply To: `project62sg@gmail.com`
   - Company Address: (Your business address)
   - Company City: (Your city)
   - Company State/Province: (Leave blank or enter state)
   - Company Zip: (Your postal code)
   - Company Country: `Singapore`
   - Nickname: `Project 62 Sender` (internal reference)

3. **Click Create**

4. **Verify the sender:**
   - SendGrid will send a verification email to `project62@cccdigital.sg`
   - You need to click the link in that email

**Important:** Since `project62@cccdigital.sg` is a new email, you need to either:
- Set up email forwarding from `project62@cccdigital.sg` to `project62sg@gmail.com` (recommended)
- Or access the mailbox directly if you have it configured

**To set up email forwarding:**
- Go to your domain provider (where you manage cccdigital.sg DNS)
- Look for "Email Forwarding" or "Email Settings"
- Create a forward: `project62@cccdigital.sg` → `project62sg@gmail.com`
- Then check your Gmail for the verification email

---

### **Step 5: Test the Email System**

Once everything is verified:

1. Go to your Project 62 app
2. Try registering a new user with your personal email
3. Check if you receive the verification email from `project62@cccdigital.sg`
4. The email should have:
   - FROM: project62@cccdigital.sg
   - Subject: "Verify Your Project 62 Account"
   - A green button to verify email

---

## Quick Reference - What You're Adding

You're adding **3 CNAME records** to prove you own `cccdigital.sg`:

1. **First record (Email subdomain)**
   - Proves you control the domain for email sending
   
2. **Second record (DKIM signature 1)**
   - Used to sign emails and prevent spam/forgery
   
3. **Third record (DKIM signature 2)**
   - Backup DKIM signature for email authentication

---

## Troubleshooting

**Q: I don't know where I registered cccdigital.sg**
- Check your email for domain renewal notices
- Try logging into common registrars: GoDaddy, Namecheap, Google Domains
- Contact whoever manages your company IT/domains

**Q: I don't have access to DNS settings**
- Ask your IT admin or whoever registered the domain
- They need to add the 3 CNAME records for you

**Q: Verification is taking too long**
- Wait 24 hours - DNS can take time to propagate
- Clear your browser cache and try verifying again
- Check if records were entered correctly (no typos)

**Q: Can I skip this and use Gmail instead?**
- No, Gmail won't allow sending from custom domains without verification
- Using `project62sg@gmail.com` would work but looks unprofessional
- Customers trust `project62@cccdigital.sg` more than Gmail addresses

**Q: What if I don't configure DNS?**
- Emails will fail to send
- Users won't receive verification emails
- Nobody can register or verify their accounts
- The app will still work, but email verification feature won't

---

## Summary

1. ✅ Go to SendGrid → Get 3 DNS records for `cccdigital.sg`
2. ✅ Add those 3 records to your DNS provider (where you manage cccdigital.sg)
3. ✅ Wait for verification (15 mins - 48 hours)
4. ✅ Add sender identity in SendGrid for `project62@cccdigital.sg`
5. ✅ Set up email forwarding (optional but recommended)
6. ✅ Test registration → Should receive email from `project62@cccdigital.sg`

**Once configured, the email verification system will work automatically!**

---

Need help? Let me know which step you're stuck on!
