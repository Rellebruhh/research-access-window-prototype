(function (RAW) {
  'use strict';

  var state = {
    search: '',
    tier: 'all',
    holder: 'all',
    requestCounter: 42,
    activeSubmission: null
  };

  var appEl = null;
  var srStatusEl = null;

  var ICONS = {
    search:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    arrowLeft:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
    check:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    imagePlaceholder:
      '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="8.5" cy="9.5" r="1.5"></circle><polyline points="21 15 16 10 5 20"></polyline></svg>'
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function announce(message) {
    if (!srStatusEl) {
      return;
    }
    srStatusEl.textContent = '';
    window.setTimeout(function () {
      srStatusEl.textContent = message;
    }, 20);
  }

  function renderTierBadge(tier) {
    if (tier === 'open') {
      return '<span class="tier-badge tier-badge--open">Open</span>';
    }
    return '<span class="tier-badge tier-badge--application">By application</span>';
  }

  function parseRoute() {
    var rawHash = window.location.hash || '#/';
    var path = rawHash.replace(/^#/, '');
    if (!path || path === '/') {
      return { view: 'catalog' };
    }
    var detailMatch = path.match(/^\/dataset\/([a-z0-9-]+)$/);
    if (detailMatch) {
      return { view: 'detail', id: detailMatch[1] };
    }
    var requestMatch = path.match(/^\/request\/([a-z0-9-]+)$/);
    if (requestMatch) {
      return { view: 'request', id: requestMatch[1] };
    }
    return { view: 'catalog' };
  }

  function navigate(hash) {
    if (window.location.hash === hash) {
      render();
      return;
    }
    window.location.hash = hash;
  }

  function filterDatasets() {
    var query = state.search.trim().toLowerCase();

    return RAW.DATASETS.filter(function (ds) {
      if (state.tier !== 'all' && ds.tier !== state.tier) {
        return false;
      }
      if (state.holder !== 'all' && ds.held_by !== state.holder) {
        return false;
      }
      if (!query) {
        return true;
      }
      var haystack = [
        ds.title,
        ds.short_description,
        ds.description,
        ds.held_by,
        ds.keywords.join(' ')
      ]
        .join(' ')
        .toLowerCase();
      return haystack.indexOf(query) !== -1;
    });
  }

  function formatCount(count) {
    return count === 1 ? '1 dataset' : count + ' datasets';
  }

  function renderCatalogResultsHtml(matches) {
    if (matches.length === 0) {
      var trimmed = state.search.trim();
      if (trimmed) {
        return (
          '<div class="empty-state">' +
          '<p class="empty-state-message">No datasets match &ldquo;' +
          escapeHtml(trimmed) +
          '&rdquo;. Try a broader term.</p>' +
          '<button type="button" class="btn btn-secondary" id="clear-search-btn">Clear search</button>' +
          '</div>'
        );
      }
      return (
        '<div class="empty-state">' +
        '<p class="empty-state-message">No datasets match the selected filters.</p>' +
        '<button type="button" class="btn btn-secondary" id="reset-filters-btn">Reset filters</button>' +
        '</div>'
      );
    }

    var rowsHtml = matches
      .map(function (ds) {
        return (
          '<tr class="dataset-row" tabindex="0" data-id="' +
          escapeHtml(ds.id) +
          '">' +
          '<td class="col-dataset">' +
          '<a class="dataset-link" href="#/dataset/' +
          escapeHtml(ds.id) +
          '" tabindex="-1">' +
          escapeHtml(ds.title) +
          '</a>' +
          '<p class="dataset-desc">' +
          escapeHtml(ds.short_description) +
          '</p>' +
          '</td>' +
          '<td class="col-holder cell-meta">' +
          escapeHtml(ds.held_by) +
          '</td>' +
          '<td class="col-updated cell-meta tabular"><time>' +
          escapeHtml(ds.last_updated) +
          '</time></td>' +
          '<td class="col-format cell-meta">' +
          escapeHtml(ds.format) +
          '</td>' +
          '<td class="col-tier">' +
          renderTierBadge(ds.tier) +
          '</td>' +
          '</tr>'
        );
      })
      .join('');

    return (
      '<div class="table-panel">' +
      '<table class="catalog-table">' +
      '<thead>' +
      '<tr>' +
      '<th scope="col" class="col-dataset">Dataset</th>' +
      '<th scope="col" class="col-holder">Held by</th>' +
      '<th scope="col" class="col-updated">Last updated</th>' +
      '<th scope="col" class="col-format">Format</th>' +
      '<th scope="col" class="col-tier">Access tier</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>' +
      rowsHtml +
      '</tbody>' +
      '</table>' +
      '</div>'
    );
  }

  function bindCatalogRowEvents() {
    var rows = appEl.querySelectorAll('.dataset-row');
    for (var i = 0; i < rows.length; i += 1) {
      (function (row) {
        var id = row.getAttribute('data-id');
        row.addEventListener('click', function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
            return;
          }
          e.preventDefault();
          navigate('#/dataset/' + id);
        });
        row.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate('#/dataset/' + id);
          }
        });
      })(rows[i]);
    }

    var clearSearchBtn = document.getElementById('clear-search-btn');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', function () {
        state.search = '';
        var input = document.getElementById('catalog-search');
        if (input) {
          input.value = '';
          input.focus();
        }
        updateCatalogResults();
      });
    }

    var resetFiltersBtn = document.getElementById('reset-filters-btn');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', function () {
        state.tier = 'all';
        state.holder = 'all';
        renderCatalog();
      });
    }
  }

  function updateCatalogResults() {
    var matches = filterDatasets();
    var countEl = document.getElementById('catalog-count');
    var resultsEl = document.getElementById('catalog-results');

    if (countEl) {
      countEl.textContent = formatCount(matches.length);
    }
    if (resultsEl) {
      resultsEl.innerHTML = renderCatalogResultsHtml(matches);
      bindCatalogRowEvents();
    }
  }

  function renderCatalog() {
    document.title = 'Research Access Window';
    var matches = filterDatasets();

    appEl.innerHTML =
      '<div class="view-shell">' +
      '<header class="site-header">' +
      '<div class="site-title-row">' +
      '<h1>Research Access Window</h1>' +
      '<span class="site-subtitle">Health data catalog, student concept</span>' +
      '</div>' +
      '<p class="site-explanation">' +
      'Find health data already collected by government agencies. Open datasets download instantly. Sensitive datasets can be requested with a fixed response time.' +
      '</p>' +
      '</header>' +
      '<section class="search-section" aria-label="Search datasets">' +
      '<label for="catalog-search" class="sr-only">Search datasets</label>' +
      '<div class="search-box">' +
      '<span class="search-icon">' +
      ICONS.search +
      '</span>' +
      '<input id="catalog-search" class="search-input" type="search" value="' +
      escapeHtml(state.search) +
      '" placeholder="Search datasets, e.g. dengue, facilities, medicines" autocomplete="off">' +
      '</div>' +
      '</section>' +
      '<section class="filter-row" aria-label="Dataset filters">' +
      '<div class="filter-controls">' +
      '<div class="segmented-control" role="group" aria-label="Filter by access tier">' +
      '<button type="button" class="seg-btn" data-tier="all" aria-pressed="' +
      (state.tier === 'all' ? 'true' : 'false') +
      '">All</button>' +
      '<button type="button" class="seg-btn" data-tier="open" aria-pressed="' +
      (state.tier === 'open' ? 'true' : 'false') +
      '">Open</button>' +
      '<button type="button" class="seg-btn" data-tier="application" aria-pressed="' +
      (state.tier === 'application' ? 'true' : 'false') +
      '">By application</button>' +
      '</div>' +
      '<label class="holder-filter" for="holder-filter">' +
      '<span>Held by</span>' +
      '<select id="holder-filter" class="select-control">' +
      '<option value="all"' +
      (state.holder === 'all' ? ' selected' : '') +
      '>All</option>' +
      '<option value="DOH"' +
      (state.holder === 'DOH' ? ' selected' : '') +
      '>DOH</option>' +
      '<option value="PhilHealth"' +
      (state.holder === 'PhilHealth' ? ' selected' : '') +
      '>PhilHealth</option>' +
      '<option value="FDA"' +
      (state.holder === 'FDA' ? ' selected' : '') +
      '>FDA</option>' +
      '</select>' +
      '</label>' +
      '</div>' +
      '<div id="catalog-count" class="result-count tabular" aria-live="polite">' +
      escapeHtml(formatCount(matches.length)) +
      '</div>' +
      '</section>' +
      '<div class="tier-legend" aria-label="Access tier descriptions">' +
      '<div class="tier-legend-item">' +
      renderTierBadge('open') +
      '<span>Instant preview and CSV download with no request.</span>' +
      '</div>' +
      '<div class="tier-legend-item">' +
      renderTierBadge('application') +
      '<span>De-identified data requiring ethics clearance and a data sharing agreement.</span>' +
      '</div>' +
      '</div>' +
      '<section id="catalog-results" aria-label="Dataset catalog">' +
      renderCatalogResultsHtml(matches) +
      '</section>' +
      '</div>';

    var searchInput = document.getElementById('catalog-search');
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        state.search = e.target.value;
        updateCatalogResults();
      });
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          if (state.search !== '') {
            state.search = '';
            searchInput.value = '';
            updateCatalogResults();
            announce('Search cleared');
          }
        }
      });
      searchInput.focus();
    }

    var tierButtons = appEl.querySelectorAll('.seg-btn[data-tier]');
    for (var i = 0; i < tierButtons.length; i += 1) {
      (function (btn) {
        btn.addEventListener('click', function () {
          state.tier = btn.getAttribute('data-tier');
          for (var j = 0; j < tierButtons.length; j += 1) {
            var isPressed = tierButtons[j] === btn;
            tierButtons[j].setAttribute('aria-pressed', isPressed ? 'true' : 'false');
          }
          updateCatalogResults();
        });
      })(tierButtons[i]);
    }

    var holderSelect = document.getElementById('holder-filter');
    if (holderSelect) {
      holderSelect.addEventListener('change', function (e) {
        state.holder = e.target.value;
        updateCatalogResults();
      });
    }

    bindCatalogRowEvents();
  }

  function renderColumnsTable(dataset) {
    var rows = dataset.columns
      .map(function (col) {
        return (
          '<tr>' +
          '<td class="col-name-cell">' +
          escapeHtml(col.name) +
          '</td>' +
          '<td>' +
          escapeHtml(col.type) +
          '</td>' +
          '<td>' +
          escapeHtml(col.description) +
          '</td>' +
          '</tr>'
        );
      })
      .join('');

    return (
      '<section class="detail-section">' +
      '<h2>Columns</h2>' +
      '<div class="table-scroll">' +
      '<table class="data-table">' +
      '<thead>' +
      '<tr>' +
      '<th scope="col">Column name</th>' +
      '<th scope="col">Type</th>' +
      '<th scope="col">Description</th>' +
      '</tr>' +
      '</thead>' +
      '<tbody>' +
      rows +
      '</tbody>' +
      '</table>' +
      '</div>' +
      '</section>'
    );
  }

  function renderPlaceholderImagesSection() {
    var views = ['Front packaging', 'Back label', 'Blister strip', 'Lot and expiry panel'];
    var tiles = views
      .map(function (viewLabel) {
        return (
          '<div class="placeholder-tile">' +
          ICONS.imagePlaceholder +
          '<span class="placeholder-tile-title">Sample image</span>' +
          '<span class="placeholder-tile-caption">' +
          escapeHtml(viewLabel) +
          '</span>' +
          '</div>'
        );
      })
      .join('');

    return (
      '<section class="detail-section">' +
      '<h2>Sample packaging views</h2>' +
      '<p class="about-text">Neutral placeholder tiles representing verified packaging angles. No real product photographs or brand names are displayed.</p>' +
      '<div class="placeholder-strip">' +
      tiles +
      '</div>' +
      '</section>'
    );
  }

  function renderPreviewSection(dataset, rows) {
    var previewRows = rows.slice(0, 10);
    var headerCells = dataset.columns
      .map(function (col) {
        return (
          '<th scope="col" class="' +
          (col.numeric ? 'is-numeric' : '') +
          '">' +
          escapeHtml(col.name) +
          '</th>'
        );
      })
      .join('');

    var bodyRows = previewRows
      .map(function (row) {
        var cells = dataset.columns
          .map(function (col) {
            return (
              '<td class="' +
              (col.numeric ? 'is-numeric' : '') +
              '">' +
              escapeHtml(row[col.name]) +
              '</td>'
            );
          })
          .join('');
        return '<tr>' + cells + '</tr>';
      })
      .join('');

    return (
      '<section class="detail-section">' +
      '<div class="preview-header">' +
      '<h2>Preview</h2>' +
      '<span class="preview-label">Preview: first 10 of ' +
      escapeHtml(rows.length) +
      ' rows, sample data</span>' +
      '</div>' +
      '<div class="table-scroll">' +
      '<table class="data-table">' +
      '<thead><tr>' +
      headerCells +
      '</tr></thead>' +
      '<tbody>' +
      bodyRows +
      '</tbody>' +
      '</table>' +
      '</div>' +
      '</section>'
    );
  }

  function renderApplicationSection(dataset) {
    return (
      '<section class="application-panel">' +
      '<h2>Why this dataset needs an application</h2>' +
      '<p class="application-explanation">' +
      'Records are de-identified, but combinations of age, geography, diagnoses, or clinical measurements can still re-identify individuals if combined with external data. Access therefore requires an approved research purpose, ethics clearance, and a signed data sharing agreement.' +
      '</p>' +
      '<div class="commitment-box">Decision within 10 working days of a complete application.</div>' +
      '<p class="requirements-title">Requirements for access:</p>' +
      '<ul class="checklist">' +
      '<li class="checklist-item"><span class="checklist-icon">' +
      ICONS.check +
      '</span><span>Clear research purpose limited to the columns needed</span></li>' +
      '<li class="checklist-item"><span class="checklist-icon">' +
      ICONS.check +
      '</span><span>Ethics clearance from a research ethics board</span></li>' +
      '<li class="checklist-item"><span class="checklist-icon">' +
      ICONS.check +
      '</span><span>Signed data sharing agreement under the Data Privacy Act</span></li>' +
      '</ul>' +
      '<a class="btn btn-primary" href="#/request/' +
      escapeHtml(dataset.id) +
      '" id="request-access-btn">Request access</a>' +
      '</section>'
    );
  }

  function copyText(text, onSuccess) {
    if (window.location.protocol !== 'file:' && navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(onSuccess, function () {
        fallbackCopy(text, onSuccess);
      });
      return;
    }
    if (fallbackCopy(text, onSuccess)) {
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(onSuccess, function () {});
    }
  }

  function fallbackCopy(text, onSuccess) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    var copied = false;
    try {
      copied = document.execCommand('copy');
      if (copied) {
        onSuccess();
      }
    } catch (_err) {
      copied = false;
    }
    document.body.removeChild(textarea);
    return copied;
  }

  function renderDetail(id) {
    var dataset = RAW.getDatasetById(id);
    if (!dataset) {
      document.title = 'Dataset not found - Research Access Window';
      appEl.innerHTML =
        '<div class="view-shell">' +
        '<a class="back-link" href="#/">' +
        ICONS.arrowLeft +
        '<span>All datasets</span></a>' +
        '<div class="empty-state">' +
        '<h1 class="empty-state-message">Dataset not found</h1>' +
        '<a class="btn btn-primary" href="#/">Back to catalog</a>' +
        '</div>' +
        '</div>';
      return;
    }

    document.title = dataset.title + ' - Research Access Window';
    var openRows = dataset.tier === 'open' ? RAW.data.getRows(dataset.id) : null;

    var tierSpecificTop = '';
    var tierSpecificPreview = '';
    if (dataset.tier === 'open') {
      tierSpecificTop =
        '<div class="open-action-bar">' +
        '<button type="button" class="btn btn-primary" id="download-csv-btn">Download CSV</button>' +
        '<span class="license-text">Open data. Free to use with citation.</span>' +
        '</div>';
      if (dataset.hasPlaceholderImages) {
        tierSpecificPreview += renderPlaceholderImagesSection();
      }
      tierSpecificPreview += renderPreviewSection(dataset, openRows);
    } else {
      tierSpecificTop = renderApplicationSection(dataset);
    }

    appEl.innerHTML =
      '<div class="view-shell">' +
      '<a class="back-link" href="#/">' +
      ICONS.arrowLeft +
      '<span>All datasets</span></a>' +
      '<header class="detail-header">' +
      '<div class="detail-title-row">' +
      '<h1>' +
      escapeHtml(dataset.title) +
      '</h1>' +
      renderTierBadge(dataset.tier) +
      '</div>' +
      '<dl class="meta-grid">' +
      '<div class="meta-item"><dt>Held by</dt><dd>' +
      escapeHtml(dataset.held_by) +
      '</dd></div>' +
      '<div class="meta-item"><dt>Last updated</dt><dd class="tabular"><time>' +
      escapeHtml(dataset.last_updated) +
      '</time></dd></div>' +
      '<div class="meta-item"><dt>Update frequency</dt><dd>' +
      escapeHtml(dataset.update_frequency) +
      '</dd></div>' +
      '<div class="meta-item"><dt>Format</dt><dd>' +
      escapeHtml(dataset.format) +
      '</dd></div>' +
      '<div class="meta-item"><dt>Coverage</dt><dd>' +
      escapeHtml(dataset.coverage) +
      '</dd></div>' +
      '</dl>' +
      '</header>' +
      '<section class="detail-section">' +
      '<h2>About this data</h2>' +
      '<p class="about-text">' +
      escapeHtml(dataset.description) +
      '</p>' +
      '</section>' +
      tierSpecificTop +
      tierSpecificPreview +
      renderColumnsTable(dataset) +
      '<section class="detail-section">' +
      '<h2>How to cite</h2>' +
      '<div class="cite-row">' +
      '<span class="cite-text" id="citation-text">' +
      escapeHtml(dataset.citation) +
      '</span>' +
      '<button type="button" class="btn btn-secondary btn-small" id="copy-citation-btn">Copy</button>' +
      '</div>' +
      '</section>' +
      '</div>';

    var downloadBtn = document.getElementById('download-csv-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function () {
        var filename = RAW.data.downloadSampleCsv(dataset);
        if (filename) {
          announce('Downloaded ' + filename);
        }
      });
    }

    var copyBtn = document.getElementById('copy-citation-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        copyText(dataset.citation, function () {
          copyBtn.textContent = 'Copied';
          announce('Citation copied');
          window.setTimeout(function () {
            copyBtn.textContent = 'Copy';
          }, 1500);
        });
      });
    }
  }

  function renderConfirmationPanel(dataset, submission) {
    return (
      '<div class="view-shell form-container">' +
      '<a class="back-link" href="#/dataset/' +
      escapeHtml(dataset.id) +
      '">' +
      ICONS.arrowLeft +
      '<span>Back to dataset</span></a>' +
      '<header class="request-header">' +
      '<h1>Access request submitted</h1>' +
      '<p class="request-dataset-meta">' +
      escapeHtml(dataset.title) +
      ' (' +
      escapeHtml(dataset.held_by) +
      ')</p>' +
      '</header>' +
      '<section class="confirmation-panel" aria-labelledby="confirmation-ref">' +
      '<div class="confirmation-ref-label">Reference number</div>' +
      '<div id="confirmation-ref" class="confirmation-ref">' +
      escapeHtml(submission.refNumber) +
      '</div>' +
      '<div class="confirmation-decision">Decision expected by ' +
      escapeHtml(submission.expectedLong) +
      '</div>' +
      '<ol class="status-tracker" aria-label="Application status">' +
      '<li class="tracker-step tracker-step--done">' +
      '<div class="tracker-step-title">Submitted</div>' +
      '<div class="tracker-step-meta tabular">' +
      escapeHtml(submission.submittedShort) +
      '</div>' +
      '</li>' +
      '<li class="tracker-step tracker-step--current">' +
      '<div class="tracker-step-title">Under review</div>' +
      '<div class="tracker-step-meta">In progress</div>' +
      '</li>' +
      '<li class="tracker-step">' +
      '<div class="tracker-step-title">Decision</div>' +
      '<div class="tracker-step-meta tabular">Expected ' +
      escapeHtml(submission.expectedShort) +
      '</div>' +
      '</li>' +
      '</ol>' +
      '<p class="confirmation-note">You will be notified by email. This is a prototype, so no email is sent.</p>' +
      '<div class="confirmation-actions">' +
      '<a class="btn btn-primary" href="#/">Back to catalog</a>' +
      '<a class="btn btn-secondary" href="#/dataset/' +
      escapeHtml(dataset.id) +
      '">View dataset</a>' +
      '</div>' +
      '</section>' +
      '</div>'
    );
  }

  function renderRequest(id) {
    var dataset = RAW.getDatasetById(id);
    if (!dataset) {
      renderDetail(id);
      return;
    }

    if (dataset.tier !== 'application') {
      document.title = 'Open dataset - Research Access Window';
      appEl.innerHTML =
        '<div class="view-shell form-container">' +
        '<a class="back-link" href="#/dataset/' +
        escapeHtml(dataset.id) +
        '">' +
        ICONS.arrowLeft +
        '<span>Back to dataset</span></a>' +
        '<div class="empty-state">' +
        '<h1 class="empty-state-message">No application is needed for this open dataset.</h1>' +
        '<a class="btn btn-primary" href="#/dataset/' +
        escapeHtml(dataset.id) +
        '">View and download dataset</a>' +
        '</div>' +
        '</div>';
      return;
    }

    if (state.activeSubmission && state.activeSubmission.datasetId === dataset.id) {
      document.title = 'Request submitted - Research Access Window';
      appEl.innerHTML = renderConfirmationPanel(dataset, state.activeSubmission);
      return;
    }

    document.title = 'Request access - ' + dataset.title + ' - Research Access Window';

    var columnCheckboxes = dataset.columns
      .map(function (col) {
        var cbId = 'col-' + col.name;
        return (
          '<label class="checkbox-label" for="' +
          escapeHtml(cbId) +
          '">' +
          '<input type="checkbox" id="' +
          escapeHtml(cbId) +
          '" name="columns" value="' +
          escapeHtml(col.name) +
          '">' +
          '<span>' +
          escapeHtml(col.name) +
          '</span>' +
          '</label>'
        );
      })
      .join('');

    appEl.innerHTML =
      '<div class="view-shell form-container">' +
      '<a class="back-link" href="#/dataset/' +
      escapeHtml(dataset.id) +
      '">' +
      ICONS.arrowLeft +
      '<span>Back to dataset</span></a>' +
      '<header class="request-header">' +
      '<h1>Request access</h1>' +
      '<p class="request-dataset-meta">' +
      escapeHtml(dataset.title) +
      ' (' +
      escapeHtml(dataset.held_by) +
      ') &middot; Decision within 10 working days</p>' +
      '</header>' +
      '<form id="request-form" class="request-panel" novalidate>' +
      '<div class="field-group">' +
      '<label class="field-label" for="req-name">Full name</label>' +
      '<input class="field-input" type="text" id="req-name" name="fullName" autocomplete="name" aria-describedby="err-name">' +
      '<div id="err-name" class="field-error" hidden></div>' +
      '</div>' +
      '<div class="field-group">' +
      '<label class="field-label" for="req-institution">Institution</label>' +
      '<input class="field-input" type="text" id="req-institution" name="institution" autocomplete="organization" aria-describedby="err-institution">' +
      '<div id="err-institution" class="field-error" hidden></div>' +
      '</div>' +
      '<div class="field-group">' +
      '<label class="field-label" for="req-role">Role</label>' +
      '<select class="field-select" id="req-role" name="role" aria-describedby="err-role">' +
      '<option value="">Select a role</option>' +
      '<option value="Undergraduate student">Undergraduate student</option>' +
      '<option value="Graduate student">Graduate student</option>' +
      '<option value="Faculty or researcher">Faculty or researcher</option>' +
      '<option value="Independent researcher">Independent researcher</option>' +
      '</select>' +
      '<div id="err-role" class="field-error" hidden></div>' +
      '</div>' +
      '<div class="field-group">' +
      '<label class="field-label" for="req-purpose">Research purpose</label>' +
      '<p class="field-helper" id="helper-purpose">Describe your study objective and how you will use these records (50 to 600 characters).</p>' +
      '<textarea class="field-textarea" id="req-purpose" name="purpose" maxlength="600" aria-describedby="helper-purpose err-purpose"></textarea>' +
      '<div id="purpose-count" class="char-counter tabular">0 / 600 characters (minimum 50)</div>' +
      '<div id="err-purpose" class="field-error" hidden></div>' +
      '</div>' +
      '<div class="field-group">' +
      '<fieldset id="req-columns-fieldset" class="columns-fieldset" aria-describedby="helper-columns err-columns">' +
      '<legend>Columns needed</legend>' +
      '<p class="field-helper" id="helper-columns">Request only what your study needs.</p>' +
      '<div class="checkbox-grid">' +
      columnCheckboxes +
      '</div>' +
      '</fieldset>' +
      '<div id="err-columns" class="field-error" hidden></div>' +
      '</div>' +
      '<div class="field-group">' +
      '<label class="field-label" for="req-ethics">Ethics clearance</label>' +
      '<p class="field-helper" id="helper-ethics">Approval letter from your research ethics board (PDF).</p>' +
      '<div class="file-picker-wrap" id="ethics-picker-wrap">' +
      '<input class="file-input" type="file" id="req-ethics" name="ethics" accept=".pdf,application/pdf" aria-describedby="helper-ethics err-ethics">' +
      '<span id="ethics-filename" class="file-status">No file selected</span>' +
      '</div>' +
      '<div id="err-ethics" class="field-error" hidden></div>' +
      '</div>' +
      '<div class="field-group">' +
      '<div class="agreement-box" id="agreement-box">' +
      '<label class="checkbox-label" for="req-agreement">' +
      '<input type="checkbox" id="req-agreement" name="agreement" aria-describedby="err-agreement">' +
      '<span class="agreement-text">I agree to the data sharing agreement, including no attempts to re-identify individuals and deletion of the data after the study.</span>' +
      '</label>' +
      '</div>' +
      '<div id="err-agreement" class="field-error" hidden></div>' +
      '</div>' +
      '<div class="form-actions">' +
      '<div class="form-actions-main">' +
      '<button type="submit" class="btn btn-primary" id="submit-request-btn">Submit request</button>' +
      '<a class="btn btn-secondary" href="#/dataset/' +
      escapeHtml(dataset.id) +
      '">Cancel</a>' +
      '</div>' +
      '<button type="button" class="btn-text-link" id="fill-sample-btn">Fill sample request</button>' +
      '</div>' +
      '</form>' +
      '</div>';

    setupRequestForm(dataset);
  }

  function setupRequestForm(dataset) {
    var form = document.getElementById('request-form');
    var nameInput = document.getElementById('req-name');
    var instInput = document.getElementById('req-institution');
    var roleSelect = document.getElementById('req-role');
    var purposeInput = document.getElementById('req-purpose');
    var purposeCountEl = document.getElementById('purpose-count');
    var columnsFieldset = document.getElementById('req-columns-fieldset');
    var ethicsInput = document.getElementById('req-ethics');
    var ethicsWrap = document.getElementById('ethics-picker-wrap');
    var ethicsNameEl = document.getElementById('ethics-filename');
    var agreementBox = document.getElementById('agreement-box');
    var agreementInput = document.getElementById('req-agreement');
    var fillSampleBtn = document.getElementById('fill-sample-btn');

    var ethicsFileName = '';
    var hadError = Object.create(null);

    function updatePurposeCount() {
      var len = purposeInput.value.length;
      purposeCountEl.textContent = len + ' / 600 characters (minimum 50)';
    }

    function setError(key, control, errId, message, container) {
      var errEl = document.getElementById(errId);
      if (message) {
        hadError[key] = true;
        errEl.textContent = message;
        errEl.hidden = false;
        control.setAttribute('aria-invalid', 'true');
        if (container) {
          container.setAttribute('data-invalid', 'true');
        }
      } else {
        errEl.textContent = '';
        errEl.hidden = true;
        control.removeAttribute('aria-invalid');
        if (container) {
          container.removeAttribute('data-invalid');
        }
      }
    }

    function getCheckedColumns() {
      var boxes = form.querySelectorAll('input[name="columns"]:checked');
      var list = [];
      for (var i = 0; i < boxes.length; i += 1) {
        list.push(boxes[i].value);
      }
      return list;
    }

    function validateName() {
      var msg = nameInput.value.trim() ? '' : 'Enter your full name.';
      setError('name', nameInput, 'err-name', msg);
      return !msg;
    }

    function validateInstitution() {
      var msg = instInput.value.trim() ? '' : 'Enter your institution or affiliation.';
      setError('institution', instInput, 'err-institution', msg);
      return !msg;
    }

    function validateRole() {
      var msg = roleSelect.value ? '' : 'Select your role.';
      setError('role', roleSelect, 'err-role', msg);
      return !msg;
    }

    function validatePurpose() {
      var len = purposeInput.value.trim().length;
      var msg = '';
      if (len < 50) {
        msg = 'Enter at least 50 characters describing your research purpose.';
      } else if (len > 600) {
        msg = 'Keep your research purpose within 600 characters.';
      }
      setError('purpose', purposeInput, 'err-purpose', msg);
      return !msg;
    }

    function validateColumns() {
      var checked = getCheckedColumns();
      var msg = checked.length > 0 ? '' : 'Select at least one column needed for your study.';
      setError('columns', columnsFieldset, 'err-columns', msg);
      return !msg;
    }

    function validateEthics() {
      var msg = '';
      if (!ethicsFileName) {
        msg = 'Attach your ethics clearance PDF file.';
      } else if (!/\.pdf$/i.test(ethicsFileName)) {
        msg = 'Ethics clearance must be a PDF file (.pdf).';
      }
      setError('ethics', ethicsInput, 'err-ethics', msg, ethicsWrap);
      return !msg;
    }

    function validateAgreement() {
      var msg = agreementInput.checked
        ? ''
        : 'Confirm that you agree to the data sharing agreement.';
      setError('agreement', agreementInput, 'err-agreement', msg, agreementBox);
      return !msg;
    }

    nameInput.addEventListener('blur', validateName);
    nameInput.addEventListener('input', function () {
      if (hadError.name) {
        validateName();
      }
    });

    instInput.addEventListener('blur', validateInstitution);
    instInput.addEventListener('input', function () {
      if (hadError.institution) {
        validateInstitution();
      }
    });

    roleSelect.addEventListener('blur', validateRole);
    roleSelect.addEventListener('change', function () {
      if (hadError.role) {
        validateRole();
      }
    });

    purposeInput.addEventListener('blur', validatePurpose);
    purposeInput.addEventListener('input', function () {
      updatePurposeCount();
      if (hadError.purpose) {
        validatePurpose();
      }
    });

    var columnInputs = form.querySelectorAll('input[name="columns"]');
    for (var i = 0; i < columnInputs.length; i += 1) {
      columnInputs[i].addEventListener('change', function () {
        if (hadError.columns) {
          validateColumns();
        }
      });
    }
    columnsFieldset.addEventListener('focusout', function (e) {
      if (!columnsFieldset.contains(e.relatedTarget) && e.relatedTarget !== fillSampleBtn) {
        validateColumns();
      }
    });

    ethicsInput.addEventListener('change', function () {
      if (ethicsInput.files && ethicsInput.files.length > 0) {
        ethicsFileName = ethicsInput.files[0].name;
        ethicsNameEl.textContent = ethicsFileName;
      } else {
        ethicsFileName = '';
        ethicsNameEl.textContent = 'No file selected';
      }
      validateEthics();
    });

    agreementInput.addEventListener('change', validateAgreement);

    fillSampleBtn.addEventListener('click', function () {
      nameInput.value = 'Juan Dela Cruz';
      instInput.value = 'University of the Philippines Diliman';
      roleSelect.value = 'Undergraduate student';
      purposeInput.value =
        'To validate a pediatric congenital heart defect risk scoring model using anonymized defect diameter, hemodynamic ratio, and follow-up duration measurements for an undergraduate research study.';
      updatePurposeCount();

      var preferred = ['age_months', 'defect_type', 'defect_diameter_mm'];
      var allBoxes = form.querySelectorAll('input[name="columns"]');
      var matchedAny = false;
      for (var k = 0; k < allBoxes.length; k += 1) {
        var check = preferred.indexOf(allBoxes[k].value) !== -1;
        allBoxes[k].checked = check;
        if (check) {
          matchedAny = true;
        }
      }
      if (!matchedAny) {
        for (var m = 0; m < allBoxes.length && m < 3; m += 1) {
          allBoxes[m].checked = true;
        }
      }

      ethicsFileName = 'ethics_approval_sample.pdf';
      ethicsNameEl.textContent = ethicsFileName;
      agreementInput.checked = true;

      validateName();
      validateInstitution();
      validateRole();
      validatePurpose();
      validateColumns();
      validateEthics();
      validateAgreement();

      announce('Sample request filled');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var checks = [
        { ok: validateName(), target: nameInput },
        { ok: validateInstitution(), target: instInput },
        { ok: validateRole(), target: roleSelect },
        { ok: validatePurpose(), target: purposeInput },
        { ok: validateColumns(), target: form.querySelector('input[name="columns"]') },
        { ok: validateEthics(), target: ethicsInput },
        { ok: validateAgreement(), target: agreementInput }
      ];

      var firstInvalid = null;
      var errorCount = 0;
      for (var c = 0; c < checks.length; c += 1) {
        if (!checks[c].ok) {
          errorCount += 1;
          if (!firstInvalid) {
            firstInvalid = checks[c].target;
          }
        }
      }

      if (firstInvalid) {
        announce(
          'Please fix ' +
            errorCount +
            (errorCount === 1 ? ' error' : ' errors') +
            ' in the request form.'
        );
        firstInvalid.focus();
        return;
      }

      var submittedDate = new Date();
      var expectedDate = RAW.dates.addWorkingDays(submittedDate, 10);
      var refNum =
        'RAW-' +
        submittedDate.getFullYear() +
        '-' +
        String(state.requestCounter).padStart(5, '0');
      state.requestCounter += 1;

      state.activeSubmission = {
        datasetId: dataset.id,
        refNumber: refNum,
        submittedShort: RAW.dates.formatShortDate(submittedDate),
        expectedShort: RAW.dates.formatShortDate(expectedDate),
        expectedLong: RAW.dates.formatLongDate(expectedDate)
      };

      document.title = 'Request submitted - Research Access Window';
      appEl.innerHTML = renderConfirmationPanel(dataset, state.activeSubmission);
      window.scrollTo(0, 0);
      var refHeading = document.getElementById('confirmation-ref');
      if (refHeading) {
        announce('Request submitted. Reference ' + refNum + '. Decision expected by ' + state.activeSubmission.expectedLong);
      }
    });
  }

  function render() {
    var route = parseRoute();
    window.scrollTo(0, 0);

    if (route.view === 'catalog') {
      renderCatalog();
    } else if (route.view === 'detail') {
      renderDetail(route.id);
    } else if (route.view === 'request') {
      renderRequest(route.id);
    }
  }

  function handleGlobalKeydown(e) {
    if (!e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    if (e.key !== 'R' && e.key !== 'r') {
      return;
    }

    var active = document.activeElement;
    if (active && active.closest && active.closest('#request-form')) {
      var tag = active.tagName;
      if (tag === 'TEXTAREA' || (tag === 'INPUT' && active.type === 'text')) {
        return;
      }
    }

    e.preventDefault();
    state.search = '';
    state.tier = 'all';
    state.holder = 'all';
    state.requestCounter = 42;
    state.activeSubmission = null;

    if (window.location.hash !== '#/' && window.location.hash !== '') {
      window.location.hash = '#/';
    } else {
      render();
    }
    announce('Prototype reset');
  }

  document.addEventListener('DOMContentLoaded', function () {
    appEl = document.getElementById('app');
    srStatusEl = document.getElementById('sr-status');

    window.addEventListener('hashchange', render);
    document.addEventListener('keydown', handleGlobalKeydown);

    render();
  });
})(window.RAW = window.RAW || {});
