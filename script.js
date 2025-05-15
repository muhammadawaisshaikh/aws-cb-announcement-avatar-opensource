let croppedImage = null;
let fileName = '';

// Set up the canvas for the banner
const canvas = document.getElementById('downloadCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 630;

const background = new Image();
background.src = './img/aws-community-builder-banner.png';
background.onload = () => ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

// Set the default user icon in the preview
document.getElementById('previewImage').src = './img/user-icon.png';

// jQuery for image upload and crop functionality
$(document).ready(function () {
    let cropper;

    // Handle image upload and initialize cropper
    $('#imageUpload').change(function (event) {
        const reader = new FileReader();
        reader.onload = function (e) {
            $('#imageToCrop').attr('src', e.target.result);
            $('#cropperContainer').show();
            $('#imagePreview').hide();

            if (cropper) cropper.destroy(); // Destroy previous cropper instance if exists

            cropper = new Cropper(document.getElementById('imageToCrop'), {
                aspectRatio: 1, // Square crop for headshot
                viewMode: 2, // Restrict crop box within container
                autoCropArea: 0.8, // Crop area 80% of the image
                scalable: false, zoomable: false, cropBoxResizable: false,
                background: true, movable: true, rotatable: true, touchDrag: true,
            });
        };
        reader.readAsDataURL(event.target.files[0]);
        fileName = event.target.files[0].name;
    });

    // Handle cropping image
    $('#cropImageBtn').click(function () {
        const croppedCanvas = cropper.getCroppedCanvas({
            width: 180, height: 180
        });

        croppedImage = croppedCanvas.toDataURL('image/png');
        $('#imagePreview').show();
        $('#previewImage').attr('src', croppedImage).show();
        $('#cropperContainer').hide();
        $('#imageUpload').val(''); // Reset the file input
    });
});

// Generate Banner with Cropped Image and Text
function generateBanner() {
    if (!croppedImage) return;

    const canvas = document.getElementById('downloadCanvas');
    const ctx = canvas.getContext('2d');
    const background = new Image();
    background.src = './img/aws-community-builder-banner.png';

    background.onload = function () {
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const img = new Image();
        img.src = croppedImage;

        img.onload = function () {
            const headshotSize = 180;
            const x = 510;
            const y = (canvas.height - headshotSize) / 2 - 180;

            // Draw Circular Headshot
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + headshotSize / 2, y + headshotSize / 2, headshotSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, x, y, headshotSize, headshotSize);
            ctx.restore();

            // Get User Inputs or Default Values
            const name = document.getElementById('nameInput').value || 'Your Name';
            const designation = document.getElementById('designationInput').value || 'Your Title';
            const company = document.getElementById('companyInput').value || 'Your Company';
            const year = document.getElementById('yearInput').value || 'AWS CB Year';

            function drawText(text, x, y, fontSize, fontWeight = 'bold') {
                ctx.font = `${fontWeight} ${fontSize}px Arial`;
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'left';
                ctx.fillText(text, x, y);
            }

            const textX = x + headshotSize + 30;
            const textY = y + headshotSize / 2 - 20;

            // Draw Text (Name, Designation, Company)
            drawText(name, textX, textY, 50);
            drawText(designation, textX, textY + 40, 30, 'normal');
            drawText(company, textX, textY + 80, 25, 'normal');
            
            const yearNum = parseInt(year);
            const yearText = isNaN(yearNum) ? year + ' Year' : `AWS CB from last ${yearNum} Year${yearNum > 1 ? 's' : ''}`;
            drawText(yearText, textX, textY + 120, 25, 'bold');

            yearDraw(year);

            triggerDownload(canvas, name);
        };
    };

    background.onerror = function () {
        alert('Error loading banner background. Ensure the image exists in the correct path.');
    };
}

// Trigger download of generated banner
function triggerDownload(canvas, name) {
    setTimeout(() => {
        const downloadLink = document.createElement('a');
        downloadLink.href = canvas.toDataURL('image/png');
        downloadLink.download = `${name.replace(/\s/g, '_')}_aws_banner.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }, 500); // Delay to ensure rendering
}

function yearDraw(year) {
    const yearNum = parseInt(year);
    const yearSuffix = !isNaN(yearNum) ? `Year${yearNum > 1 ? 's' : ''}` : '';
    const yearDisplay = !isNaN(yearNum) ? `${yearNum} ${yearSuffix}` : year;

    // Draw Circular Year Badge at bottom-right
    const badgeRadius = 60;
    const badgeX = canvas.width - badgeRadius - 40;
    const badgeY = canvas.height - badgeRadius - 40;

    // Draw circle border
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#FFA500'; // Orange border
    ctx.stroke();
    ctx.closePath();

    // Optional: fill background inside the badge (e.g., semi-transparent white)
    ctx.fillStyle = '#161e2d';
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // Draw year text inside circle
    ctx.fillStyle = '#FFA500'; // Orange text
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(yearDisplay, badgeX, badgeY);

}