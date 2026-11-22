(function (RAW) {
  'use strict';

  RAW.DATASETS = [
    {
      id: 'dengue-cases-city',
      title: 'Dengue cases by city, monthly',
      tier: 'open',
      held_by: 'DOH',
      format: 'CSV',
      last_updated: '14 Oct 2026',
      update_frequency: 'Monthly',
      coverage: '2023-2025, 20 selected cities',
      short_description: 'Monthly sample counts of reported dengue cases across 20 cities.',
      description:
        'Aggregated monthly counts of reported dengue cases grouped by city and administrative region from 2023 to 2025. Contains synthetic aggregate figures only, with no individual patient details or clinic identifiers. Useful for seasonal trend analysis and public health teaching exercises.',
      keywords: ['dengue', 'surveillance', 'epidemiology', 'cities', 'monthly', 'vector'],
      citation:
        'Research Access Window (student concept). (2026). Dengue cases by city, monthly [Sample dataset].',
      columns: [
        { name: 'city', type: 'text', description: 'City or municipality name', numeric: false },
        { name: 'region', type: 'text', description: 'Administrative region code', numeric: false },
        { name: 'year', type: 'integer', description: 'Calendar year (2023 to 2025)', numeric: true },
        { name: 'month', type: 'integer', description: 'Calendar month (1 to 12)', numeric: true },
        { name: 'cases', type: 'integer', description: 'Sample reported dengue case count', numeric: true }
      ]
    },
    {
      id: 'pediatric-echo',
      title: 'Pediatric echocardiography measurements, de-identified',
      tier: 'application',
      held_by: 'DOH',
      format: 'CSV',
      last_updated: '28 Sep 2026',
      update_frequency: 'Quarterly',
      coverage: '2021-2025, national referral centers',
      short_description: 'De-identified pediatric heart defect scans and follow-up outcomes.',
      description:
        'De-identified clinical echocardiography measurements for pediatric patients evaluated for congenital heart defects. Includes defect dimensions, hemodynamic ratios, interventions, and follow-up duration across participating centers. Requires ethics clearance and a data sharing agreement because rare measurement profiles may risk re-identification.',
      keywords: ['pediatric', 'echocardiography', 'cardiology', 'congenital', 'heart', 'clinical'],
      citation:
        'Research Access Window (student concept). (2026). Pediatric echocardiography measurements, de-identified [Sample dataset].',
      columns: [
        { name: 'record_id', type: 'text', description: 'Random study record identifier', numeric: false },
        { name: 'age_months', type: 'integer', description: 'Patient age at scan in months', numeric: true },
        { name: 'sex', type: 'text', description: 'Recorded biological sex (F or M)', numeric: false },
        { name: 'region', type: 'text', description: 'Patient region of residence', numeric: false },
        { name: 'defect_type', type: 'text', description: 'Primary structural defect classification', numeric: false },
        { name: 'defect_diameter_mm', type: 'number', description: 'Measured defect diameter in millimeters', numeric: true },
        { name: 'aortic_annulus_mm', type: 'number', description: 'Measured aortic annulus diameter in millimeters', numeric: true },
        { name: 'qp_qs_ratio', type: 'number', description: 'Pulmonary-to-systemic blood flow ratio', numeric: true },
        { name: 'peak_gradient_mmHg', type: 'number', description: 'Peak Doppler pressure gradient in mmHg', numeric: true },
        { name: 'intervention', type: 'text', description: 'Intervention category performed', numeric: false },
        { name: 'follow_up_months', type: 'integer', description: 'Months of documented follow-up', numeric: true }
      ]
    },
    {
      id: 'health-facilities',
      title: 'Licensed health facilities registry',
      tier: 'open',
      held_by: 'DOH',
      format: 'CSV',
      last_updated: '02 Nov 2026',
      update_frequency: 'Quarterly',
      coverage: '2026 snapshot, nationwide',
      short_description: 'Public directory of licensed facility types, service levels, and beds.',
      description:
        'Registry of licensed health facilities categorized by facility type, service capability level, city, region, and authorized bed capacity. All facility names in this prototype are synthetic generic names created for demonstration. Designed for geographic access mapping and capacity planning.',
      keywords: ['facilities', 'hospitals', 'clinics', 'licensing', 'registry', 'beds'],
      citation:
        'Research Access Window (student concept). (2026). Licensed health facilities registry [Sample dataset].',
      columns: [
        { name: 'facility_name', type: 'text', description: 'Generic synthetic facility name', numeric: false },
        { name: 'type', type: 'text', description: 'Facility classification (Hospital, Infirmary, Clinic)', numeric: false },
        { name: 'level', type: 'text', description: 'Service capability level', numeric: false },
        { name: 'city', type: 'text', description: 'City or municipality location', numeric: false },
        { name: 'region', type: 'text', description: 'Administrative region code', numeric: false },
        { name: 'bed_capacity', type: 'integer', description: 'Authorized bed capacity count', numeric: true }
      ]
    },
    {
      id: 'philhealth-claims',
      title: 'Inpatient claims, de-identified',
      tier: 'application',
      held_by: 'PhilHealth',
      format: 'CSV',
      last_updated: '19 Oct 2026',
      update_frequency: 'Semi-annual',
      coverage: '2022-2025, nationwide',
      short_description: 'De-identified inpatient claims with diagnoses and length of stay.',
      description:
        'De-identified inpatient reimbursement claim records containing age group, sex, region, primary ICD-10 diagnosis, length of stay, facility level, and claimed amount. Supports health economics, case-rate evaluation, and utilization studies. Access is gated because detailed claim combinations can enable re-identification.',
      keywords: ['philhealth', 'claims', 'inpatient', 'insurance', 'icd10', 'expenditure'],
      citation:
        'Research Access Window (student concept). (2026). Inpatient claims, de-identified [Sample dataset].',
      columns: [
        { name: 'claim_id', type: 'text', description: 'Random synthetic claim identifier', numeric: false },
        { name: 'age_group', type: 'text', description: 'Five-year patient age bracket', numeric: false },
        { name: 'sex', type: 'text', description: 'Recorded biological sex (F or M)', numeric: false },
        { name: 'region', type: 'text', description: 'Facility administrative region', numeric: false },
        { name: 'primary_diagnosis_icd10', type: 'text', description: 'Primary ICD-10 diagnosis code', numeric: false },
        { name: 'length_of_stay_days', type: 'integer', description: 'Inpatient stay duration in days', numeric: true },
        { name: 'facility_level', type: 'text', description: 'Accredited hospital level', numeric: false },
        { name: 'amount_claimed_php', type: 'number', description: 'Benefit amount claimed in Philippine pesos', numeric: true }
      ]
    },
    {
      id: 'medicine-reference-images',
      title: 'Reference images of verified medicine packaging',
      tier: 'open',
      held_by: 'FDA',
      format: 'CSV manifest + images',
      last_updated: '06 Nov 2026',
      update_frequency: 'Monthly',
      coverage: '2025-2026, essential generic medicines',
      hasPlaceholderImages: true,
      short_description: 'Manifest and standard views of verified generic medicine packaging.',
      description:
        'Structured manifest indexing standardized reference photographs of verified generic medicine packaging across front, back, and blister pack views. Intended for inspection training and automated verification research using generic formulations only. No real commercial product photographs or brand names are included in this concept sample.',
      keywords: ['medicine', 'packaging', 'images', 'verification', 'fda', 'generic', 'blister'],
      citation:
        'Research Access Window (student concept). (2026). Reference images of verified medicine packaging [Sample dataset].',
      columns: [
        { name: 'image_file', type: 'text', description: 'Standardized manifest image filename', numeric: false },
        { name: 'generic_name', type: 'text', description: 'Generic active ingredient name', numeric: false },
        { name: 'dosage_form', type: 'text', description: 'Formulation (Tablet, Capsule, Syrup, Suspension)', numeric: false },
        { name: 'view', type: 'text', description: 'Packaging angle (front, back, or blister)', numeric: false },
        { name: 'resolution', type: 'text', description: 'Pixel dimensions of the reference image', numeric: false }
      ]
    },
    {
      id: 'registered-drugs',
      title: 'Registered drug products',
      tier: 'open',
      held_by: 'FDA',
      format: 'CSV',
      last_updated: '30 Oct 2026',
      update_frequency: 'Monthly',
      coverage: '2026 active and renewal sample list',
      short_description: 'Generic drug formulations, dosage strengths, and registration status.',
      description:
        'Sample catalog of registered drug formulations listing generic names, dosage forms, strengths, and regulatory registration statuses. Brand names are omitted so the prototype demonstrates standardized generic product indexing. Suitable for formulary cross-checks and availability studies.',
      keywords: ['drugs', 'pharmacy', 'generic', 'registration', 'formulary', 'fda'],
      citation:
        'Research Access Window (student concept). (2026). Registered drug products [Sample dataset].',
      columns: [
        { name: 'generic_name', type: 'text', description: 'Generic active pharmaceutical ingredient', numeric: false },
        { name: 'dosage_form', type: 'text', description: 'Formulation type', numeric: false },
        { name: 'strength', type: 'text', description: 'Labeled active strength per unit', numeric: false },
        { name: 'registration_status', type: 'text', description: 'Sample regulatory status', numeric: false }
      ]
    },
    {
      id: 'counterfeit-advisories',
      title: 'Counterfeit medicine advisories',
      tier: 'open',
      held_by: 'FDA',
      format: 'CSV',
      last_updated: '11 Nov 2026',
      update_frequency: 'Weekly',
      coverage: '2024-2026, nationwide public alerts',
      short_description: 'Public safety alerts flagging counterfeit generic medicine batches.',
      description:
        'Structured log of sample public warnings covering suspected counterfeit medicines by generic name, dosage form, issue date, and visual inspection cues. Helps pharmacies, clinics, and researchers track recurring packaging anomalies without exposing brand trademarks.',
      keywords: ['counterfeit', 'medicine', 'advisories', 'safety', 'alerts', 'fda'],
      citation:
        'Research Access Window (student concept). (2026). Counterfeit medicine advisories [Sample dataset].',
      columns: [
        { name: 'advisory_no', type: 'text', description: 'Sample public advisory reference code', numeric: false },
        { name: 'generic_name', type: 'text', description: 'Generic medicine name cited in alert', numeric: false },
        { name: 'dosage_form', type: 'text', description: 'Formulation type', numeric: false },
        { name: 'date_issued', type: 'text', description: 'ISO date advisory was issued', numeric: false },
        { name: 'distinguishing_features', type: 'text', description: 'Observed visual or print anomaly', numeric: false }
      ]
    },
    {
      id: 'hospital-beds-region',
      title: 'Hospital bed capacity by region',
      tier: 'open',
      held_by: 'DOH',
      format: 'CSV',
      last_updated: '09 Sep 2026',
      update_frequency: 'Annual',
      coverage: '2022-2025, all 17 regions',
      short_description: 'Annual regional totals of government and private hospital beds.',
      description:
        'Regional annual summary comparing total authorized government hospital beds and private hospital beds across all 17 administrative regions from 2022 to 2025. Contains synthetic aggregate regional counts only.',
      keywords: ['hospitals', 'beds', 'capacity', 'region', 'government', 'private'],
      citation:
        'Research Access Window (student concept). (2026). Hospital bed capacity by region [Sample dataset].',
      columns: [
        { name: 'region', type: 'text', description: 'Administrative region name', numeric: false },
        { name: 'year', type: 'integer', description: 'Reporting calendar year', numeric: true },
        { name: 'government_beds', type: 'integer', description: 'Sample government hospital bed count', numeric: true },
        { name: 'private_beds', type: 'integer', description: 'Sample private hospital bed count', numeric: true }
      ]
    },
    {
      id: 'discharge-records',
      title: 'Hospital discharge summaries, de-identified',
      tier: 'application',
      held_by: 'DOH',
      format: 'CSV',
      last_updated: '22 Oct 2026',
      update_frequency: 'Quarterly',
      coverage: '2022-2025, sentinel hospitals',
      short_description: 'De-identified inpatient diagnoses, procedures, and outcomes.',
      description:
        'De-identified hospital discharge records capturing age group, sex, region, primary ICD-10 diagnosis, procedure code, discharge outcome, and length of stay. Supports clinical outcomes and readmission research. Requires ethics review and a signed data sharing agreement.',
      keywords: ['discharge', 'hospital', 'inpatient', 'outcomes', 'icd10', 'procedures'],
      citation:
        'Research Access Window (student concept). (2026). Hospital discharge summaries, de-identified [Sample dataset].',
      columns: [
        { name: 'record_id', type: 'text', description: 'Random synthetic discharge record ID', numeric: false },
        { name: 'age_group', type: 'text', description: 'Patient age group bracket', numeric: false },
        { name: 'sex', type: 'text', description: 'Recorded biological sex (F or M)', numeric: false },
        { name: 'region', type: 'text', description: 'Hospital administrative region', numeric: false },
        { name: 'diagnosis_icd10', type: 'text', description: 'Primary ICD-10 diagnosis code', numeric: false },
        { name: 'procedure_code', type: 'text', description: 'Primary inpatient procedure code', numeric: false },
        { name: 'outcome', type: 'text', description: 'Discharge disposition category', numeric: false },
        { name: 'length_of_stay_days', type: 'integer', description: 'Total inpatient stay in days', numeric: true }
      ]
    }
  ];

  RAW.getDatasetById = function (id) {
    return RAW.DATASETS.find(function (ds) {
      return ds.id === id;
    }) || null;
  };
})(window.RAW = window.RAW || {});
