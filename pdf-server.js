import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
app.use(express.json({ limit: '10mb' }));

// Basic CORS handling for local development
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/api/generate-pdf', async (req, res) => {
  const { html } = req.body;
  if (!html) {
    return res.status(400).send('Missing html content');
  }

  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
  } catch (err) {
    console.error('Error generating PDF', err);
    res.status(500).send('Error generating PDF');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`PDF server listening on port ${PORT}`);
});
