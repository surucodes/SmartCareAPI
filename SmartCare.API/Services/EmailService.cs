using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using SmartCare.API.Interfaces;
using SmartCare.API.Models;

namespace SmartCare.API.Services;

public class EmailService : IEmailService
{
    private readonly string _host;
    private readonly int _port;
    private readonly string _senderEmail;
    private readonly string _senderPassword;
    private readonly string _senderName;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _host = config["EmailSettings:SmtpHost"]!;
        _port = int.Parse(config["EmailSettings:SmtpPort"]!);
        _senderEmail = config["EmailSettings:SenderEmail"]!;
        _senderPassword = config["EmailSettings:SenderPassword"]!;
        _senderName = config["EmailSettings:SenderName"]!;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        _logger.LogInformation("Sending email to {ToEmail}, subject: {Subject}", toEmail, subject);

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_senderName, _senderEmail));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = htmlBody };

        using var client = new SmtpClient();
        await client.ConnectAsync(_host, _port, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_senderEmail, _senderPassword);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);

        _logger.LogInformation("Email sent successfully to {ToEmail}", toEmail);
    }

    public async Task SendBookingConfirmationAsync(Appointment appointment, Doctor doctor)
    {
        var html = BuildConfirmationEmail(appointment, doctor);
        await SendEmailAsync(
            appointment.PatientEmail,
            appointment.PatientName,
            "Your SmartCare Appointment — We'll See You Soon",
            html);
    }

    public async Task SendAppointmentConfirmedAsync(Appointment appointment, Doctor doctor)
    {
        var html = BuildStatusConfirmedEmail(appointment, doctor);
        await SendEmailAsync(
            appointment.PatientEmail,
            appointment.PatientName,
            $"Appointment Confirmed — See You on {appointment.Date}",
            html);
    }

    public async Task SendAppointmentCancelledAsync(Appointment appointment, Doctor doctor, string cancelledBy)
    {
        var html = BuildStatusCancelledEmail(appointment, doctor, cancelledBy);
        var subject = cancelledBy == "Reschedule"
            ? "Your SmartCare Appointment Has Been Rescheduled"
            : "Your SmartCare Appointment Has Been Cancelled";
        await SendEmailAsync(
            appointment.PatientEmail,
            appointment.PatientName,
            subject,
            html);
    }

    public async Task SendPostVisitEmailAsync(Appointment appointment, Doctor doctor)
    {
        var html = BuildPostVisitEmail(appointment, doctor);
        await SendEmailAsync(
            appointment.PatientEmail,
            appointment.PatientName,
            "Thank You for Visiting SmartCare Hospital",
            html);
    }

    private static string BuildConfirmationEmail(Appointment appointment, Doctor doctor) => $$"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: #1a73e8; padding: 28px 32px; }
            .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
            .body { padding: 28px 32px; }
            .body p { color: #444; line-height: 1.6; }
            .details { background: #f8f9fa; border-radius: 6px; padding: 20px 24px; margin: 20px 0; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e8eaed; }
            .row:last-child { border-bottom: none; }
            .label { color: #888; font-size: 13px; }
            .value { color: #222; font-weight: 600; font-size: 14px; }
            .footer { background: #f8f9fa; padding: 16px 32px; text-align: center; color: #aaa; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>Appointment Request Received</h1>
            </div>
            <div class="body">
              <p>Dear {{appointment.PatientName}}, we've received your appointment request and our team will be in touch shortly to confirm. Here are the details:</p>
              <div class="details">
                <div class="row"><span class="label">Doctor:</span><span class="value">{{doctor.Name}}</span></div>
                <div class="row"><span class="label">Specialty:</span><span class="value">{{doctor.Specialty}}</span></div>
                <div class="row"><span class="label">Date:</span><span class="value">{{appointment.Date}}</span></div>
                <div class="row"><span class="label">Time:</span><span class="value">{{appointment.Slot}}</span></div>
                <div class="row"><span class="label">Appointment ID:</span><span class="value">{{appointment.Id}}</span></div>
              </div>
              <p>We look forward to seeing you. Dr. {{doctor.Name}} and the SmartCare team are here to take good care of you. Please arrive 10 minutes early and bring any previous records or prescriptions if relevant.</p>
            </div>
            <div class="footer">
              SmartCare Hospital, Bengaluru &mdash; For queries call us at [contact]
            </div>
          </div>
        </body>
        </html>
        """;

    private static string BuildStatusConfirmedEmail(Appointment appointment, Doctor doctor) => $$"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: #1a73e8; padding: 28px 32px; }
            .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
            .body { padding: 28px 32px; }
            .body p { color: #444; line-height: 1.6; }
            .details { background: #f8f9fa; border-radius: 6px; padding: 20px 24px; margin: 20px 0; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e8eaed; }
            .row:last-child { border-bottom: none; }
            .label { color: #888; font-size: 13px; }
            .value { color: #222; font-weight: 600; font-size: 14px; }
            .footer { background: #f8f9fa; padding: 16px 32px; text-align: center; color: #aaa; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>Appointment Confirmed</h1>
            </div>
            <div class="body">
              <p>Dear {{appointment.PatientName}}, great news — your appointment has been confirmed!</p>
              <div class="details">
                <div class="row"><span class="label">Doctor:</span><span class="value">{{doctor.Name}}</span></div>
                <div class="row"><span class="label">Specialty:</span><span class="value">{{doctor.Specialty}}</span></div>
                <div class="row"><span class="label">Date:</span><span class="value">{{appointment.Date}}</span></div>
                <div class="row"><span class="label">Time:</span><span class="value">{{appointment.Slot}}</span></div>
                <div class="row"><span class="label">Appointment ID:</span><span class="value">{{appointment.Id}}</span></div>
              </div>
              <p>We are looking forward to your visit. If you need to make any changes, please contact us at least 24 hours in advance.</p>
            </div>
            <div class="footer">
              SmartCare Hospital, Bengaluru &mdash; For queries call us at [contact]
            </div>
          </div>
        </body>
        </html>
        """;

    private static string BuildStatusCancelledEmail(Appointment appointment, Doctor doctor, string cancelledBy)
    {
        var isReschedule = cancelledBy == "Reschedule";
        var headerTitle = isReschedule ? "Appointment Rescheduled" : "Appointment Cancelled";
        var bodyText = isReschedule
            ? $"Dear {appointment.PatientName}, your appointment with {doctor.Name} on {appointment.Date} at {appointment.Slot} has been rescheduled. A separate email confirming your new appointment date and time has been sent to you — please refer to it for the updated details. There is nothing further you need to do."
            : cancelledBy == "Admin"
                ? $"Dear {appointment.PatientName}, we regret to inform you that your appointment with {doctor.Name} on {appointment.Date} at {appointment.Slot} has been cancelled by the hospital due to unforeseen circumstances. We sincerely apologise for the inconvenience. Please contact us to reschedule at your convenience."
                : $"Dear {appointment.PatientName}, your appointment with {doctor.Name} on {appointment.Date} at {appointment.Slot} has been successfully cancelled as requested. We hope to see you again soon — you can book a new appointment at any time.";

        return $$"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
                .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .header { background: #1a73e8; padding: 28px 32px; }
                .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
                .body { padding: 28px 32px; }
                .body p { color: #444; line-height: 1.6; }
                .details { background: #f8f9fa; border-radius: 6px; padding: 20px 24px; margin: 20px 0; }
                .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e8eaed; }
                .row:last-child { border-bottom: none; }
                .label { color: #888; font-size: 13px; }
                .value { color: #222; font-weight: 600; font-size: 14px; }
                .footer { background: #f8f9fa; padding: 16px 32px; text-align: center; color: #aaa; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="header">
                  <h1>{{headerTitle}}</h1>
                </div>
                <div class="body">
                  <p>{{bodyText}}</p>
                  <div class="details">
                    <div class="row"><span class="label">Doctor:</span><span class="value">{{doctor.Name}}</span></div>
                    <div class="row"><span class="label">Specialty:</span><span class="value">{{doctor.Specialty}}</span></div>
                    <div class="row"><span class="label">Date:</span><span class="value">{{appointment.Date}}</span></div>
                    <div class="row"><span class="label">Time:</span><span class="value">{{appointment.Slot}}</span></div>
                    <div class="row"><span class="label">Appointment ID:</span><span class="value">{{appointment.Id}}</span></div>
                  </div>
                  <p>For queries or rescheduling, please call us at [contact].</p>
                </div>
                <div class="footer">
                  SmartCare Hospital, Bengaluru &mdash; For queries call us at [contact]
                </div>
              </div>
            </body>
            </html>
            """;
    }

    private static string BuildPostVisitEmail(Appointment appointment, Doctor doctor) => $$"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
            .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { background: #1a73e8; padding: 28px 32px; }
            .header h1 { color: #ffffff; margin: 0; font-size: 22px; }
            .body { padding: 28px 32px; }
            .body p { color: #444; line-height: 1.6; }
            .review-btn { display: inline-block; margin: 16px 0; padding: 12px 28px; background: #1a73e8; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; }
            .footer { background: #f8f9fa; padding: 16px 32px; text-align: center; color: #aaa; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="header">
              <h1>Thank You for Visiting Us</h1>
            </div>
            <div class="body">
              <p>Dear {{appointment.PatientName}}, we hope your visit with {{doctor.Name}} went well and that you are feeling better. Your health and comfort are our priority.</p>
              <p>If you have a moment, we would love to hear about your experience. Your feedback helps us serve our patients better.</p>
              <p>
                <a class="review-btn" href="https://g.page/r/GOOGLE_MAPS_REVIEW_LINK_HERE/review">
                  Leave a Review on Google Maps
                </a>
              </p>
              <p>Thank you for choosing SmartCare. We look forward to being your trusted healthcare partner.</p>
            </div>
            <div class="footer">
              SmartCare Hospital, Bengaluru &mdash; For queries call us at [contact]
            </div>
          </div>
        </body>
        </html>
        """;
}
