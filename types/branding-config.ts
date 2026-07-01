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
      staffName: "Jordan | Loan Officer",
      staffTitle: "Senior Loan Officer",
      contactEmail: "loanofficer@orbittmortgage.com",
    },
    underwriting: {
      staffName: "Underwriting Department",
      staffTitle: "Underwriting Specialist",
      contactEmail: "underwriting@orbittmortgage.com",
    },
    funding: {
      staffName: "Funding Department",
      staffTitle: "Funding Operations Manager",
      contactEmail: "funding@orbittmortgage.com",
    },
    closings: {
      staffName: "Closing Department",
      staffTitle: "Closing Coordinator",
      contactEmail: "closing@orbittmortgage.com",
    },
    support: {
      staffName: "Customer Support",
      staffTitle: "Client Support Team",
      contactEmail: "support@orbittmortgage.com",
    },
    executive: {
      staffName: "Chief Lending Officer",
      staffTitle: "Chief Lending Officer",
      contactEmail: "lending@orbittmortgage.com",
    },
  },
};
