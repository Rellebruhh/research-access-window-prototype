# Research Access Window (Student Concept Prototype)

An offline web prototype created for a 7-minute persuasive speech in Speech 30 (UP Diliman). It illustrates a three-part research access window for health datasets: a searchable public catalog, an open tier with instant sample CSV downloads, and an application tier for de-identified sensitive datasets with a fixed 10-working-day response commitment.

> **Disclaimer:** Student concept prototype for a class speech. Not affiliated with the DOH, PhilHealth, or the FDA. All data shown is sample data.

## How to open

1. Download or clone this repository (or copy `index.html` by itself to your Android tablet or laptop).
2. Tap or double-click `index.html` to open it directly in Google Chrome or Microsoft Edge.
3. `index.html` is fully self-contained (all styles, sample data, and scripts are inlined), so it works offline even when Android file managers open it via a `content://` URI. No build step, local server, or internet connection is required.

## 60-second demo click path

1. Open `index.html`. The catalog loads with the search box focused and shows the tier badges.
2. Click **Dengue cases by city, monthly** to show the 10-row sample preview, then click **Download CSV** to download `dengue-cases-city_SAMPLE.csv`.
3. Return to **All datasets** and click **Pediatric echocardiography measurements, de-identified**. Point out that only the column list is shown (no patient rows) alongside the **10 working days** decision commitment.
4. Click **Request access**, click **Fill sample request** at the bottom of the form, and click **Submit request** to display the reference number, computed expected decision date, and three-step status tracker.
5. Click **Back to catalog**, type `medicine` to surface **Reference images of verified medicine packaging**, then replace it with `echocardiography` to surface **Pediatric echocardiography measurements, de-identified**.
6. Press `Shift + R` to reset the prototype back to the starting catalog state before the next run.

## Presenter helpers

- **`Shift + R`** (or **double-tap the top concept notice bar** on touch devices): Resets search, filters, and any submitted request in memory and returns to `#/` (keyboard shortcut disabled while typing inside text fields on the request form).
- **Fill sample request**: Fills all required fields on the access request form in one tap or click during the live demo.
- **Tablet and touch support**: Touch targets (`>= 44px`), stacked tablet portrait list rows, and non-intrusive search focus on coarse touch screens keep Android tablet screen recordings clean and smooth.
