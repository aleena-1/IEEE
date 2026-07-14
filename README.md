# IEEE PRISMTECH Hackathon Website

Static, responsive website for the IEEE PRISMTECH Hackathon with a premium futuristic technology theme.

## Local Preview

The site can be served from this directory with:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4173/
```

## Demo Features

- Home page with logo, hero banner, event details, countdown, and highlights.
- About, schedule, problem statements, rules, prizes, people, committees, FAQ, venue, sponsors, gallery, and contact sections.
- Team registration form with validation, duplicate email / roll prevention, automatic registration ID, and local confirmation message.
- Team dashboard login by email or registration ID, project link submission, and confirmation receipt download.
- Demo admin panel with registration search, approval, CSV export, announcements, certificate action, and registration statistics.
- Downloadable rulebook and problem statement PDFs.
- Privacy and terms pages.

## Demo Admin

```text
Password: admin123
```

## Production Notes

This implementation is a static front-end demo using browser `localStorage`. For production, connect secure authentication, a database, email delivery, file storage, CAPTCHA, role-based access, audit logs, WhatsApp/email notification APIs, certificate templates, and QR-code check-in services.
