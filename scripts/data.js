(function (RAW) {
  'use strict';

  var rowCache = Object.create(null);

  function createRng(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state + 0x6d2b79f5) >>> 0;
      var t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  function pick(rng, list) {
    return list[Math.floor(rng() * list.length)];
  }

  function pad(num, width) {
    var str = String(num);
    while (str.length < width) {
      str = '0' + str;
    }
    return str;
  }

  var CITIES = [
    { city: 'Quezon City', region: 'NCR', weight: 1.45 },
    { city: 'Manila', region: 'NCR', weight: 1.25 },
    { city: 'Caloocan', region: 'NCR', weight: 1.05 },
    { city: 'Pasig', region: 'NCR', weight: 0.85 },
    { city: 'Taguig', region: 'NCR', weight: 0.9 },
    { city: 'Baguio', region: 'CAR', weight: 0.55 },
    { city: 'San Fernando (La Union)', region: 'Region I', weight: 0.5 },
    { city: 'Tuguegarao', region: 'Region II', weight: 0.48 },
    { city: 'San Fernando (Pampanga)', region: 'Region III', weight: 0.82 },
    { city: 'Angeles', region: 'Region III', weight: 0.72 },
    { city: 'Antipolo', region: 'Region IV-A', weight: 0.92 },
    { city: 'Calamba', region: 'Region IV-A', weight: 0.78 },
    { city: 'Puerto Princesa', region: 'MIMAROPA', weight: 0.46 },
    { city: 'Legazpi', region: 'Region V', weight: 0.52 },
    { city: 'Iloilo City', region: 'Region VI', weight: 0.84 },
    { city: 'Cebu City', region: 'Region VII', weight: 1.15 },
    { city: 'Tacloban', region: 'Region VIII', weight: 0.54 },
    { city: 'Zamboanga City', region: 'Region IX', weight: 0.75 },
    { city: 'Cagayan de Oro', region: 'Region X', weight: 0.88 },
    { city: 'Davao City', region: 'Region XI', weight: 1.2 }
  ];

  var REGIONS = [
    'NCR',
    'CAR',
    'Region I',
    'Region II',
    'Region III',
    'Region IV-A',
    'MIMAROPA',
    'Region V',
    'Region VI',
    'Region VII',
    'Region VIII',
    'Region IX',
    'Region X',
    'Region XI',
    'Region XII',
    'Caraga',
    'BARMM'
  ];

  var GENERIC_MEDICINES = [
    { name: 'Paracetamol', forms: ['Tablet', 'Syrup'], strengths: ['500 mg', '250 mg/5 mL'] },
    { name: 'Amoxicillin', forms: ['Capsule', 'Suspension'], strengths: ['500 mg', '250 mg/5 mL'] },
    { name: 'Metformin', forms: ['Tablet'], strengths: ['500 mg', '850 mg'] },
    { name: 'Amlodipine', forms: ['Tablet'], strengths: ['5 mg', '10 mg'] },
    { name: 'Losartan', forms: ['Tablet'], strengths: ['50 mg', '100 mg'] },
    { name: 'Cefalexin', forms: ['Capsule', 'Suspension'], strengths: ['500 mg', '250 mg/5 mL'] },
    { name: 'Salbutamol', forms: ['Tablet', 'Syrup', 'Nebule'], strengths: ['2 mg', '2 mg/5 mL', '2.5 mg/2.5 mL'] },
    { name: 'Azithromycin', forms: ['Tablet', 'Suspension'], strengths: ['500 mg', '200 mg/5 mL'] },
    { name: 'Omeprazole', forms: ['Capsule'], strengths: ['20 mg', '40 mg'] },
    { name: 'Cetirizine', forms: ['Tablet', 'Syrup'], strengths: ['10 mg', '5 mg/5 mL'] },
    { name: 'Atorvastatin', forms: ['Tablet'], strengths: ['10 mg', '20 mg', '40 mg'] },
    { name: 'Co-amoxiclav', forms: ['Tablet', 'Suspension'], strengths: ['625 mg', '457 mg/5 mL'] },
    { name: 'Mefenamic Acid', forms: ['Capsule', 'Tablet'], strengths: ['500 mg', '250 mg'] },
    { name: 'Ibuprofen', forms: ['Tablet', 'Suspension'], strengths: ['400 mg', '200 mg/5 mL'] },
    { name: 'Ascorbic Acid', forms: ['Tablet', 'Syrup'], strengths: ['500 mg', '100 mg/5 mL'] }
  ];

  var GENERATORS = {
    'dengue-cases-city': function () {
      var rng = createRng(104729);
      var rows = [];
      var years = [2023, 2024, 2025];
      var seasonal = [0.65, 0.55, 0.5, 0.55, 0.75, 1.1, 1.45, 1.7, 1.6, 1.35, 1.0, 0.8];

      for (var y = 0; y < years.length; y += 1) {
        for (var m = 1; m <= 12; m += 1) {
          for (var c = 0; c < CITIES.length; c += 1) {
            var item = CITIES[c];
            var base = 42 * item.weight * seasonal[m - 1];
            var jitter = 0.75 + rng() * 0.55;
            rows.push({
              city: item.city,
              region: item.region,
              year: years[y],
              month: m,
              cases: Math.max(4, Math.round(base * jitter))
            });
          }
        }
      }
      return rows;
    },

    'health-facilities': function () {
      var rng = createRng(219403);
      var rows = [];
      var prefixes = [
        'North Valley',
        'South Harbor',
        'Central Plains',
        'East Bay',
        'Highland',
        'Riverside',
        'Sunrise',
        'Metro District',
        'Coastal',
        'Midland',
        'Greenfield',
        'Westgate'
      ];
      var suffixes = [
        'General Hospital',
        'Medical Center',
        'Community Hospital',
        'Health Clinic',
        'Infirmary'
      ];
      var types = [
        { type: 'Hospital', levels: ['Level 1', 'Level 2', 'Level 3'], beds: [35, 320] },
        { type: 'Infirmary', levels: ['Infirmary'], beds: [10, 24] },
        { type: 'Primary Care Clinic', levels: ['Primary'], beds: [0, 8] }
      ];

      for (var i = 0; i < 120; i += 1) {
        var cityInfo = CITIES[i % CITIES.length];
        var t = types[i % 5 === 0 ? 1 : (i % 7 === 0 ? 2 : 0)];
        var name =
          prefixes[i % prefixes.length] +
          ' ' +
          suffixes[Math.floor(i / prefixes.length) % suffixes.length] +
          ' ' +
          pad((i % 9) + 1, 2);

        rows.push({
          facility_name: name,
          type: t.type,
          level: pick(rng, t.levels),
          city: cityInfo.city,
          region: cityInfo.region,
          bed_capacity: randInt(rng, t.beds[0], t.beds[1])
        });
      }
      return rows;
    },

    'registered-drugs': function () {
      var rng = createRng(330191);
      var rows = [];
      var statuses = ['Active', 'Active', 'Active', 'Active', 'For Renewal', 'Suspended'];

      for (var i = 0; i < 150; i += 1) {
        var med = GENERIC_MEDICINES[i % GENERIC_MEDICINES.length];
        var form = med.forms[i % med.forms.length];
        var strength = med.strengths[i % med.strengths.length];
        rows.push({
          generic_name: med.name,
          dosage_form: form,
          strength: strength,
          registration_status: pick(rng, statuses)
        });
      }
      return rows;
    },

    'counterfeit-advisories': function () {
      var rng = createRng(449817);
      var rows = [];
      var anomalies = [
        'Misspelled batch header and blurred security foil',
        'Incorrect expiry date font and faded blister ink',
        'Missing lot code embossing on outer carton',
        'Off-color label stock and irregular seal perforation',
        'Inconsistent tablet scoring and unaligned dosage text'
      ];

      for (var i = 0; i < 45; i += 1) {
        var med = GENERIC_MEDICINES[(i * 3) % GENERIC_MEDICINES.length];
        var year = 2024 + (i % 3);
        var month = pad(((i * 5) % 11) + 1, 2);
        var day = pad(((i * 7) % 27) + 1, 2);
        rows.push({
          advisory_no: 'ADV-SAMPLE-' + year + '-' + pad(i + 1, 3),
          generic_name: med.name,
          dosage_form: med.forms[0],
          date_issued: year + '-' + month + '-' + day,
          distinguishing_features: anomalies[i % anomalies.length]
        });
      }
      return rows;
    },

    'medicine-reference-images': function () {
      var rng = createRng(552811);
      var rows = [];
      var views = ['front', 'back', 'blister'];
      var resolutions = ['1200x900', '1600x1200', '1920x1080'];

      for (var i = 0; i < 90; i += 1) {
        var med = GENERIC_MEDICINES[Math.floor(i / 3) % GENERIC_MEDICINES.length];
        var view = views[i % views.length];
        var slug = med.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        rows.push({
          image_file: 'sample_' + slug + '_' + view + '_' + pad(i + 1, 3) + '.png',
          generic_name: med.name,
          dosage_form: med.forms[i % med.forms.length],
          view: view,
          resolution: pick(rng, resolutions)
        });
      }
      return rows;
    },

    'hospital-beds-region': function () {
      var rng = createRng(667123);
      var rows = [];
      var years = [2022, 2023, 2024, 2025];

      for (var y = 0; y < years.length; y += 1) {
        for (var r = 0; r < REGIONS.length; r += 1) {
          var region = REGIONS[r];
          var scale = region === 'NCR' ? 4.2 : (region === 'Region IV-A' || region === 'Region III' || region === 'Region VII' ? 1.8 : 1.0);
          var gov = Math.round((2100 + y * 95 + randInt(rng, 0, 260)) * scale);
          var priv = Math.round((1900 + y * 110 + randInt(rng, 0, 290)) * scale);
          rows.push({
            region: region,
            year: years[y],
            government_beds: gov,
            private_beds: priv
          });
        }
      }
      return rows;
    }
  };

  function getRows(datasetId) {
    var dataset = RAW.getDatasetById(datasetId);
    if (!dataset || dataset.tier !== 'open') {
      return null;
    }
    if (!rowCache[datasetId]) {
      var generator = GENERATORS[datasetId];
      rowCache[datasetId] = generator ? generator() : [];
    }
    return rowCache[datasetId];
  }

  function escapeCsvCell(value) {
    var str = value === null || value === undefined ? '' : String(value);
    if (/[",\r\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  function buildCsv(dataset, rows) {
    var colNames = dataset.columns.map(function (col) {
      return col.name;
    });
    var lines = [colNames.map(escapeCsvCell).join(',')];

    for (var i = 0; i < rows.length; i += 1) {
      var row = rows[i];
      var line = colNames.map(function (colName) {
        return escapeCsvCell(row[colName]);
      });
      lines.push(line.join(','));
    }

    return lines.join('\r\n') + '\r\n';
  }

  function downloadSampleCsv(dataset) {
    var rows = getRows(dataset.id);
    if (!rows) {
      return null;
    }
    var csvContent = buildCsv(dataset, rows);
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    var filename = dataset.id + '_SAMPLE.csv';

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);

    return filename;
  }

  RAW.data = {
    getRows: getRows,
    buildCsv: buildCsv,
    downloadSampleCsv: downloadSampleCsv
  };
})(window.RAW = window.RAW || {});
