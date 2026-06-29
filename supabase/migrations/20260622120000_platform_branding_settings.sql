-- Branding and contact settings for emails and public site

insert into public.platform_settings (key, value)
values (
  'branding',
  '{
    "institutionName": "Orbit Mortgage",
    "tagline": "Home financing made simple",
    "supportEmail": "support@orbittmortgage.com",
    "supportPhone": "(313) 555-0189",
    "officeHours": "Mon – Fri: 8:00 AM – 6:00 PM EST",
    "addressLine1": "500 Mortgage Way, Suite 200",
    "addressLine2": "",
    "city": "Omaha",
    "state": "NE",
    "zipCode": "68102",
    "websiteDomain": "www.orbittmortgage.com",
    "bankPartnerName": "Pathward National Bank",
    "departmentDefaults": {
      "loan_officer": {
        "staffName": "Orbit Mortgage Loan Team",
        "staffTitle": "Senior Loan Officer",
        "contactEmail": "support@orbittmortgage.com"
      },
      "underwriting": {
        "staffName": "Orbit Mortgage Underwriting",
        "staffTitle": "Underwriting Specialist",
        "contactEmail": "support@orbittmortgage.com"
      },
      "funding": {
        "staffName": "Orbit Mortgage Funding Team",
        "staffTitle": "Funding Operations Manager",
        "contactEmail": "support@orbittmortgage.com"
      },
      "closings": {
        "staffName": "Orbit Mortgage Closing Team",
        "staffTitle": "Closing Coordinator",
        "contactEmail": "support@orbittmortgage.com"
      },
      "support": {
        "staffName": "Orbit Mortgage Support",
        "staffTitle": "Client Support Team",
        "contactEmail": "support@orbittmortgage.com"
      },
      "executive": {
        "staffName": "Orbit Mortgage Leadership",
        "staffTitle": "Chief Lending Officer",
        "contactEmail": "support@orbittmortgage.com"
      }
    }
  }'::jsonb
)
on conflict (key) do update
set value = excluded.value;
