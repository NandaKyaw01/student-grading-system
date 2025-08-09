'use server';

import puppeteer from 'puppeteer';

export async function generateDashboardPDF(html: string) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: false,
    });

    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      timeout: 30000,
      preferCSSPageSize: false,
      width: '1920px',
      height: '1080px'
    });

    await browser.close();

    return pdf;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
}