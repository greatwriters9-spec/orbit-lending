export type BrandingDepartmentDefaults = {
  staffName: string;
  staffTitle: string;
  contactEmail: string;
};

export type BrandingConfig = {
  institutionName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  officeHours: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  websiteDomain: string;
  bankPartnerName: string;
  departmentDefaults: {
    loan_officer: BrandingDepartmentDefaults;
    underwriting: BrandingDepartmentDefaults;
    funding: BrandingDepartmentDefaults;
    closings: BrandingDepartmentDefaults;
    support: BrandingDepartmentDefaults;
    executive: BrandingDepartmentDefaults;
  };
};

export const BRANDING_SETTINGS_KEY = "branding";

export const DEFAULT_BRANDING_CONFIG: BrandingConfig = {
  institutionName: "Orbit Mortgage",
  tagline: "Home financing made simple",
  supportEmail: "support@orbittmortgage.com",
  supportPhone: "(313) 555-0189",
  officeHours: "Mon – Fri: 8:00 AM – 6:00 PM EST",
  addressLine1: "500 Mortgage Way, Suite 200",
  addressLine2: "",
  city: "Omaha",
  state: "NE",
  zipCode: "68102",
  websiteDomain: "www.orbittmortgage.com",
  bankPartnerName: "Pathward National Bank",
  departmentDefaults: {
    loan_officer: {
      staffName: "Orbit Mortgage Loan Team",
      staffTitle: "Senior Loan Officer",
      contactEmail: "support@orbittmortgage.com",
    },
    underwriting: {
      staffName: "Orbit Mortgage Underwriting",
      staffTitle: "Underwriting Specialist",
      contactEmail: "support@orbittmortgage.com",
    },
    funding: {
      staffName: "Orbit Mortgage Funding Team",
      staffTitle: "Funding Operations Manager",
      contactEmail: "support@orbittmortgage.com",
    },
    closings: {
      staffName: "Orbit Mortgage Closing Team",
      staffTitle: "Closing Coordinator",
      contactEmail: "support@orbittmortgage.com",
    },
    support: {
      staffName: "Orbit Mortgage Support",
      staffTitle: "Client Support Team",
      contactEmail: "support@orbittmortgage.com",
    },
    executive: {
      staffName: "Orbit Mortgage Leadership",
      staffTitle: "Chief Lending Officer",
      contactEmail: "support@orbittmortgage.com",
    },
  },
};
