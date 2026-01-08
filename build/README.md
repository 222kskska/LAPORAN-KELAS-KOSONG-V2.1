# Application Icons

## Required Files

Place the following icon files in this directory:

- `icon.ico` - Application icon (512x512 px, .ico format)
- `installerHeader.bmp` - Installer header image (optional)
- `installerSidebar.bmp` - Installer sidebar image (optional)

## How to Create Icons

### Using Online Tool:
1. Go to https://www.icoconverter.com/
2. Upload your logo/image (PNG recommended)
3. Select size: 512x512
4. Download as icon.ico
5. Place in this folder

### Using Image Editor:
1. Create a 512x512 px image in your favorite editor
2. Export/Save as .ico format
3. Name it `icon.ico`
4. Place in this folder

## Temporary Solution

If you don't have an icon yet, the build will use Electron's default icon.
To remove the warning, comment out the icon references in package.json:

```json
"win": {
  "target": "nsis"
  // "icon": "build/icon.ico"  // Commented out
}
```

## Icon Requirements

- Format: ICO
- Size: 512x512 pixels (will be scaled down automatically)
- Color: 32-bit with alpha channel (transparency)
- Background: Transparent recommended
