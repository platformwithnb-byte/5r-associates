# 5R Associates - Professional Website

A modern, bright, and professional website for 5R Associates, a local architecture and contracting business specializing in construction, interior design, and painting services.

## Features

✨ **Bilingual Support**: English and Kannada with easy language switching  
🎨 **Bright Civil Engineering Theme**: Modern, trustworthy design with vibrant colors  
📱 **Fully Responsive**: Mobile-first design that works on all devices  
🔄 **Dynamic Content**: All text loaded from JSON files (no hard-coded text)  
🎯 **Services**: Construction (including MS/SS Fabrication), Interior Design, Painting  
🏗️ **Project Showcase**: Portfolio with filtering by service type  
📧 **Contact Form**: Easy enquiry system for potential clients  

## Services

1. **Construction** - Residential and non-commercial building construction
   - New construction (homes, apartments)
   - Non-commercial buildings (schools, hospitals)
   - Renovations and extensions
   - MS and SS Fabrication (sub-service)

2. **Interior Design** - Complete interior design solutions
   - Home and apartment interiors
   - Modular kitchens and wardrobes
   - Custom furniture and lighting

3. **Painting** - Professional painting services
   - Interior and exterior painting
   - Texture and decorative finishes
   - Waterproofing

## Coverage Areas

- Intra-District projects
- Inter-City projects
- Inter-State projects

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No frameworks, pure JS
- **JSON** - Content management system

## File Structure

```
civil engineer(5R contractor)/
├── index.html                 # Home page
├── services.html              # Services with accordion
├── about.html                 # Company information
├── portfolio.html             # Project showcase
├── contact.html               # Contact form
├── assets/
│   ├── css/
│   │   └── style.css         # Main stylesheet
│   ├── js/
│   │   ├── contentLoader.js  # i18n content loader
│   │   └── app.js            # Application logic
│   ├── images/               # Image assets
│   └── logo.svg              # Company logo
├── content/
│   ├── en/                   # English content
│   │   ├── common.json
│   │   ├── home.json
│   │   ├── services.json
│   │   ├── about.json
│   │   ├── portfolio.json
│   │   └── contact.json
│   └── kn/                   # Kannada content
│       ├── common.json
│       ├── home.json
│       ├── services.json
│       ├── about.json
│       ├── portfolio.json
│       └── contact.json
└── data/
    └── portfolio.items.json  # Portfolio project data
```

## Running the Website

### Option 1: Python HTTP Server
```powershell
cd "d:\VMB activity\AIPlayground\civil engineer(5R contractor)"
python -m http.server 8000
```
Then open: http://localhost:8000

### Option 2: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

### Option 3: Direct File Opening
Simply open `index.html` in your web browser (some features may be limited)

## Content Management

All text content is stored in JSON files under `content/en/` and `content/kn/`. To update content:

1. Open the relevant JSON file
2. Edit the text values (keep the keys unchanged)
3. Save the file
4. Refresh the browser

**Example** - Updating the tagline:
```json
// In content/en/common.json or content/kn/common.json
{
  "site": {
    "tagline": "One stop solutions for all your construction needs."
  }
}
```

## Service Order

Services are always displayed in this fixed order:
1. Construction
2. Interior Design
3. Painting

This order is enforced throughout the website for consistency.

## Services Accordion

The services page features a single-open accordion:
- Click a service to expand and view details
- Opening one service automatically closes the previous one
- Each service shows its category label
- MS/SS Fabrication appears as a sub-service under Construction

## Portfolio

The portfolio showcases 9 sample projects with:
- Service type filtering (All, Construction, Interior, Painting)
- Project images, descriptions, and locations
- Support for intra-district, inter-city, and inter-state projects

To add/edit portfolio items, modify `data/portfolio.items.json`.

## Language Support

The website supports English and Kannada:
- Language preference is saved in browser localStorage
- Click "EN" or "ಕನ್ನಡ" buttons to switch languages
- All content reloads dynamically without page refresh

## About 5R Associates

- **Founded**: 1999
- **Experience**: 26+ years in the industry
- **Tagline**: "One stop solutions for all your construction needs."
- **Specialization**: Residential and non-commercial projects

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Future Enhancements

- Add real project images to portfolio
- Implement contact form backend
- Add client testimonials section
- Integrate Google Maps for service areas
- Add WhatsApp integration
- SEO optimization

## Version

**v1.0** - Initial website scaffold with navbar, tagline, logo, services accordion, and bilingual content system

## License

© 2025 5R Associates. All rights reserved.

## Support

For website updates or technical support, contact the development team.
