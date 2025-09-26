// pdf-server.js - Serveur PDF final pour votre projet Rentalyzer
import express from 'express';
import puppeteer from 'puppeteer';

const app = express();

// Configuration middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS pour votre application React
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Fonction utilitaire pour garantir un Buffer (correction de votre problème)
function ensureBuffer(data) {
  if (Buffer.isBuffer(data)) {
    return data;
  }
  
  if (data instanceof Uint8Array) {
    return Buffer.from(data);
  }
  
  if (Array.isArray(data)) {
    return Buffer.from(data);
  }
  
  if (typeof data === 'object' && data !== null) {
    // Gestion du cas où Puppeteer retourne un objet avec des indices numériques
    if (typeof data[0] === 'number') {
      const array = Object.keys(data)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(key => data[key]);
      return Buffer.from(array);
    }
    
    if (data.data) {
      return ensureBuffer(data.data);
    }
  }
  
  throw new Error(`Cannot convert ${typeof data} to Buffer`);
}

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Rentalyzer PDF Generator',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Test rapide de fonctionnement
app.get('/api/test', async (req, res) => {
  let browser;
  
  try {
    console.log('🧪 Test PDF rapide...');
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial; padding: 20px;">
        <h1 style="color: #2563eb;">Test Rentalyzer PDF</h1>
        <p>✅ Le serveur PDF fonctionne correctement</p>
        <p>Généré le ${new Date().toLocaleString('fr-FR')}</p>
      </body>
      </html>
    `);

    const pdfResult = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    await browser.close();
    
    const pdfBuffer = ensureBuffer(pdfResult);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test-rentalyzer.pdf"');
    res.end(pdfBuffer);
    
    console.log('✅ Test PDF envoyé');

  } catch (error) {
    console.error('❌ Erreur test:', error);
    if (browser) await browser.close();
    
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Génération PDF principale pour vos rapports Rentalyzer
app.post('/api/generate-pdf', async (req, res) => {
  let browser;
  const startTime = Date.now();
  
  try {
    console.log('\n🚀 Génération rapport Rentalyzer - début');
    
    const { html } = req.body;
    
    // Validation entrée
    if (!html || typeof html !== 'string') {
      console.error('❌ HTML manquant ou invalide');
      return res.status(400).json({ 
        error: 'HTML content manquant ou invalide',
        received: typeof html
      });
    }

    console.log(`📄 HTML reçu: ${html.length} caractères`);

    // Configuration Puppeteer optimisée pour vos rapports
    console.log('🌐 Lancement navigateur...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-first-run',
        '--single-process'
      ],
      timeout: 60000
    });

    const page = await browser.newPage();
    
    // Configuration optimale pour vos rapports
    await page.setViewport({ width: 1200, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // HTML propre avec tous les styles Tailwind essentiels pour vos rapports
    const cleanHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rapport d'Analyse Rentalyzer</title>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Arial, sans-serif;
            line-height: 1.5;
            color: #374151;
            font-size: 14px;
            background: white;
          }
          
          /* Classes Tailwind essentielles pour vos rapports */
          .bg-white { background-color: #ffffff !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          .bg-gray-100 { background-color: #f3f4f6 !important; }
          .bg-blue-50 { background-color: #eff6ff !important; }
          .bg-green-50 { background-color: #f0fdf4 !important; }
          .bg-red-50 { background-color: #fef2f2 !important; }
          .bg-orange-50 { background-color: #fff7ed !important; }
          .bg-purple-50 { background-color: #faf5ff !important; }
          
          .text-gray-400 { color: #9ca3af !important; }
          .text-gray-500 { color: #6b7280 !important; }
          .text-gray-600 { color: #4b5563 !important; }
          .text-gray-700 { color: #374151 !important; }
          .text-gray-800 { color: #1f2937 !important; }
          .text-gray-900 { color: #111827 !important; }
          .text-blue-600 { color: #2563eb !important; }
          .text-blue-800 { color: #1e40af !important; }
          .text-green-600 { color: #16a34a !important; }
          .text-green-700 { color: #15803d !important; }
          .text-red-600 { color: #dc2626 !important; }
          .text-red-700 { color: #b91c1c !important; }
          .text-orange-600 { color: #ea580c !important; }
          .text-purple-600 { color: #9333ea !important; }
          .text-emerald-600 { color: #059669 !important; }
          .text-indigo-600 { color: #4f46e5 !important; }
          .text-amber-600 { color: #d97706 !important; }
          .text-cyan-600 { color: #0891b2 !important; }
          .text-rose-600 { color: #e11d48 !important; }
          
          .font-medium { font-weight: 500; }
          .font-semibold { font-weight: 600; }
          .font-bold { font-weight: 700; }
          
          .text-xs { font-size: 0.75rem; line-height: 1rem; }
          .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .text-base { font-size: 1rem; line-height: 1.5rem; }
          .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
          .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .text-2xl { font-size: 1.5rem; line-height: 2rem; }
          .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
          .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
          
          .p-1 { padding: 0.25rem; }
          .p-2 { padding: 0.5rem; }
          .p-3 { padding: 0.75rem; }
          .p-4 { padding: 1rem; }
          .p-5 { padding: 1.25rem; }
          .p-6 { padding: 1.5rem; }
          .p-8 { padding: 2rem; }
          
          .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
          .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
          .px-8 { padding-left: 2rem; padding-right: 2rem; }
          
          .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
          .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
          .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
          .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
          
          .m-1 { margin: 0.25rem; }
          .m-2 { margin: 0.5rem; }
          .m-4 { margin: 1rem; }
          .m-6 { margin: 1.5rem; }
          .m-8 { margin: 2rem; }
          
          .mx-auto { margin-left: auto; margin-right: auto; }
          
          .mb-1 { margin-bottom: 0.25rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-6 { margin-bottom: 1.5rem; }
          .mb-8 { margin-bottom: 2rem; }
          
          .mt-2 { margin-top: 0.5rem; }
          .mt-3 { margin-top: 0.75rem; }
          .mt-4 { margin-top: 1rem; }
          .mt-6 { margin-top: 1.5rem; }
          .mt-8 { margin-top: 2rem; }
          
          .border { border: 1px solid #e5e7eb; }
          .border-gray-200 { border-color: #e5e7eb; }
          .border-t { border-top: 1px solid #e5e7eb; }
          .border-b { border-bottom: 1px solid #e5e7eb; }
          
          .rounded { border-radius: 0.25rem; }
          .rounded-md { border-radius: 0.375rem; }
          .rounded-lg { border-radius: 0.5rem; }
          .rounded-xl { border-radius: 0.75rem; }
          .rounded-full { border-radius: 9999px; }
          
          .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
          .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
          .shadow-lg { 
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb !important;
          }
          
          .grid { display: grid; }
          .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          
          .gap-1 { gap: 0.25rem; }
          .gap-2 { gap: 0.5rem; }
          .gap-3 { gap: 0.75rem; }
          .gap-4 { gap: 1rem; }
          .gap-6 { gap: 1.5rem; }
          .gap-8 { gap: 2rem; }
          
          .flex { display: flex; }
          .inline-flex { display: inline-flex; }
          .items-start { align-items: flex-start; }
          .items-center { align-items: center; }
          .items-end { align-items: flex-end; }
          .justify-start { justify-content: flex-start; }
          .justify-center { justify-content: center; }
          .justify-between { justify-content: space-between; }
          .justify-end { justify-content: flex-end; }
          .flex-1 { flex: 1 1 0%; }
          .flex-col { flex-direction: column; }
          
          .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
          .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
          .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
          .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
          .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
          .space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }
          
          .w-full { width: 100%; }
          .w-auto { width: auto; }
          .w-4 { width: 1rem; }
          .w-5 { width: 1.25rem; }
          .w-6 { width: 1.5rem; }
          .w-8 { width: 2rem; }
          .w-16 { width: 4rem; }
          .w-32 { width: 8rem; }
          
          .h-4 { height: 1rem; }
          .h-5 { height: 1.25rem; }
          .h-6 { height: 1.5rem; }
          .h-8 { height: 2rem; }
          .h-16 { height: 4rem; }
          .h-32 { height: 8rem; }
          
          .max-w-3xl { max-width: 48rem; }
          .max-w-4xl { max-width: 56rem; }
          .max-w-5xl { max-width: 64rem; }
          .max-w-6xl { max-width: 72rem; }
          .max-w-none { max-width: none; }
          
          .min-h-screen { min-height: 100vh; }
          
          .text-left { text-align: left; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          
          .overflow-x-auto { overflow-x: auto; }
          .overflow-hidden { overflow: hidden; }
          
          .relative { position: relative; }
          .absolute { position: absolute; }
          
          .top-2 { top: 0.5rem; }
          .right-2 { right: 0.5rem; }
          .right-10 { right: 2.5rem; }
          
          /* Gradients pour vos rapports */
          .bg-gradient-to-r, .bg-gradient-to-br {
            background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%) !important;
          }
          
          /* Tables */
          table { border-collapse: collapse; width: 100%; }
          th, td { 
            border: 1px solid #e5e7eb; 
            padding: 0.5rem; 
            text-align: left; 
          }
          th { background-color: #f3f4f6; font-weight: 600; }
          
          /* Responsiveness pour PDF */
          .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          
          .sm\\:flex-row { flex-direction: row; }
          .sm\\:justify-between { justify-content: space-between; }
          .sm\\:items-center { align-items: center; }
          .sm\\:p-6 { padding: 1.5rem; }
          .sm\\:text-base { font-size: 1rem; }
          .sm\\:text-2xl { font-size: 1.5rem; }
          
          /* Print optimizations */
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .page-break {
              page-break-after: always;
            }
            
            .avoid-break {
              page-break-inside: avoid;
            }
            
            .print-hidden {
              display: none !important;
            }
          }
          
          /* Animations et transitions désactivées pour PDF */
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        </style>
      </head>
      <body>
        <div class="max-w-6xl mx-auto p-4">
          ${html}
        </div>
      </body>
      </html>
    `;

    console.log('📄 Chargement contenu...');
    await page.setContent(cleanHtml, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000 
    });

    console.log('🖨️ Configuration impression...');
    await page.emulateMediaType('print');
    
    // Attendre que tout soit rendu
    await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve);
        }
      });
    });

    console.log('📝 Génération PDF...');
    const pdfResult = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '15mm',
        right: '10mm',
        bottom: '15mm', 
        left: '10mm'
      },
      displayHeaderFooter: false,
      timeout: 60000
    });

    await browser.close();
    browser = null;

    console.log(`✅ PDF brut généré: ${pdfResult?.length || pdfResult?.byteLength || 'taille inconnue'} bytes`);

    // Application de la correction Buffer critique
    const pdfBuffer = ensureBuffer(pdfResult);
    console.log(`✅ Buffer PDF final: ${pdfBuffer.length} bytes`);

    // Validation finale
    const header = pdfBuffer.slice(0, 4).toString('ascii');
    if (header !== '%PDF') {
      throw new Error(`En-tête PDF invalide: "${header}"`);
    }

    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Temps de traitement: ${processingTime}ms`);

    // Envoi du PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', 'attachment; filename="rapport-rentalyzer.pdf"');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Processing-Time', `${processingTime}ms`);
    
    res.end(pdfBuffer);
    
    console.log('📤 Rapport Rentalyzer envoyé avec succès');

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Erreur génération PDF (${processingTime}ms):`, {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    if (browser) {
      try {
        await browser.close();
        console.log('🔒 Navigateur fermé après erreur');
      } catch (closeError) {
        console.error('Erreur fermeture navigateur:', closeError);
      }
    }
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Erreur lors de la génération du rapport PDF',
        message: error.message,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString()
      });
    }
  }
});

// Gestion d'erreur globale
app.use((error, req, res, next) => {
  console.error('💥 Erreur non gérée:', error);
  if (!res.headersSent) {
    res.status(500).json({ 
      error: 'Erreur serveur interne',
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n🚀 Serveur PDF Rentalyzer démarré avec succès`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test rapide: http://localhost:${PORT}/api/test`);
  console.log(`📄 Génération: POST http://localhost:${PORT}/api/generate-pdf`);
  console.log(`\n✅ Prêt à générer vos rapports d'analyse immobilière`);
  console.log(`💡 Optimisé pour les rapports Rentalyzer avec tous les styles Tailwind`);
});

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', () => {
  console.log('\n🔴 Arrêt du serveur PDF Rentalyzer...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔴 Arrêt du serveur PDF Rentalyzer...');
  process.exit(0);
});