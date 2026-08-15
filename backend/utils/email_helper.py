import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import email.utils
import logging
import datetime

logger = logging.getLogger(__name__)

def send_status_email(candidate_email, candidate_name, job_title, company, new_status):
    """
    Sends an email notification to the candidate when their application status is updated.
    If SMTP credentials are not provided in environment variables, it logs/writes the email to a local file.
    """
    subject = f"Application Update: {job_title} at {company}"
    
    # Custom message body depending on status
    status_msg = ""
    if new_status == "shortlisted":
        status_msg = f"We are pleased to inform you that your application has been shortlisted! Our team will review your profile for the next steps."
    elif new_status == "interview":
        status_msg = f"Great news! You have been scheduled for an interview session. Please log in to your dashboard to view the details and complete any scheduled tasks."
    elif new_status == "selected":
        status_msg = f"Congratulations! We are thrilled to let you know that you have been selected for the {job_title} position. Our HR team will reach out with the offer details shortly."
    elif new_status == "rejected":
        status_msg = f"Thank you for taking the time to apply and interview for the {job_title} role. Unfortunately, we have decided to move forward with other candidates at this time. We wish you the best in your future endeavors."
    else: # e.g. applied / standard update
        status_msg = f"Your application status for the {job_title} role has been updated to: {new_status}."

    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #0F1728; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: #06B6D4; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">Placement AI</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 8px 8px;">
                <p>Hello <strong>{candidate_name}</strong>,</p>
                <p>{status_msg}</p>
                <br />
                <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #0F1728;">Application Details:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 4px 0; color: #64748B; font-weight: bold; width: 120px;">Position:</td>
                            <td style="padding: 4px 0; color: #0F1728;">{job_title}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748B; font-weight: bold;">Company:</td>
                            <td style="padding: 4px 0; color: #0F1728;">{company}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748B; font-weight: bold;">Updated Status:</td>
                            <td style="padding: 4px 0; color: #06B6D4; font-weight: bold; text-transform: uppercase;">{new_status}</td>
                        </tr>
                    </table>
                </div>
                <p>Log in to your Candidate Portal to check your progress and status history.</p>
                <br />
                <p>Best regards,<br /><strong>Placement AI Recruitment Team</strong></p>
            </div>
            <div style="font-size: 11px; color: #94A3B8; text-align: center; margin-top: 20px;">
                This is an automated notification. Please do not reply directly to this email.
            </div>
        </body>
    </html>
    """

    # Read SMTP Config
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM", smtp_user or "noreply@placementai.com")

    # If SMTP is not configured, fall back to log file output (robust development mode)
    if not smtp_host or not smtp_user or not smtp_pass:
        print(f"[MOCK EMAIL DISPATCH] SMTP credentials not set. Logging email to candidate {candidate_email}")
        logger.info(f"[MOCK EMAIL DISPATCH] To: {candidate_email} ({candidate_name}) | Status: {new_status}")
        
        # Write to log file for easy validation
        log_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../logs"))
        os.makedirs(log_dir, exist_ok=True)
        log_file = os.path.join(log_dir, "email_dispatches.log")
        try:
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"\n--- {datetime.datetime.utcnow().isoformat()} ---\n")
                f.write(f"To: {candidate_email} ({candidate_name})\n")
                f.write(f"Subject: {subject}\n")
                f.write(f"Message: {status_msg}\n")
        except Exception as e:
            print(f"Failed to write mock email dispatch log: {e}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = smtp_from
        msg["To"] = candidate_email
        msg["Date"] = email.utils.formatdate(localtime=True)
        msg["Message-ID"] = email.utils.make_msgid(domain=smtp_from.split('@')[-1])
        msg["Auto-Submitted"] = "auto-generated"

        # Plain text fallback
        text_content = f"Hello {candidate_name},\n\n{status_msg}\n\nPosition: {job_title}\nCompany: {company}\nStatus: {new_status.upper()}\n\nBest regards,\nPlacement AI Recruitment Team"
        
        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        # Send email via SMTP
        port = int(smtp_port) if smtp_port else 587
        server = smtplib.SMTP(smtp_host, port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_from, [candidate_email], msg.as_string())
        server.quit()
        logger.info(f"Successfully sent email notification to {candidate_email} for status: {new_status}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email notification to {candidate_email}: {e}")
        print(f"Failed to send email to {candidate_email}: {e}")
        return False
