let cropper;

// Show placeholder in result canvas
showPlaceholder();

$('#inputImage').on('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        $('#mainImage').attr('src', e.target.result).show();

        if (cropper) {
            cropper.destroy();
        }

        $('#mainImage').cropper({
            aspectRatio: 1,
            viewMode: 1,
            autoCropArea: 1,
            dragMode: 'move',
            responsive: true,
        });

        cropper = $('#mainImage').data('cropper');
    };
    reader.readAsDataURL(file);
});

$('#overlayLogoBtn').on('click', function () {
    if (!cropper) return alert('Please select an image.');

    const canvas = cropper.getCroppedCanvas({
        width: 300,
        height: 300,
    });

    const circularCanvas = document.createElement('canvas');
    circularCanvas.width = 300;
    circularCanvas.height = 300;
    const ctx = circularCanvas.getContext('2d');

    ctx.beginPath();
    ctx.arc(150, 150, 150, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(canvas, 0, 0, 300, 300);

    const overlayImg = new Image();
    overlayImg.onload = function () {
        ctx.drawImage(overlayImg, 0, 0, 300, 300);

        const resultCanvas = document.getElementById('resultCanvas');
        resultCanvas.width = 300;
        resultCanvas.height = 300;
        resultCanvas.getContext('2d').drawImage(circularCanvas, 0, 0);

        // 🔽 Auto-download the generated image
        const downloadLink = document.createElement('a');
        downloadLink.href = resultCanvas.toDataURL('image/png');
        downloadLink.download = 'aws-cb-avatar.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };
    overlayImg.src = './img/aws-avatar-overlay.png';
});

// NEW: Cancel/Reset logic
$('#cancelBtn').on('click', function () {
    // Destroy cropper if exists
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }

    // Hide the main image
    $('#mainImage').hide().attr('src', '');

    // Reset file input
    $('#inputImage').val('');

    // Show placeholder in result canvas
    showPlaceholder();
});

function showPlaceholder() {
    const resultCanvas = document.getElementById('resultCanvas');
    const ctx = resultCanvas.getContext('2d');
    const placeholder = new Image();

    placeholder.onload = function () {
        const canvasSize = 300;
        resultCanvas.width = canvasSize;
        resultCanvas.height = canvasSize;

        ctx.clearRect(0, 0, canvasSize, canvasSize);

        // Clip to circle
        ctx.beginPath();
        ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Compute scaled square fit
        const { width, height } = placeholder;
        let sx = 0, sy = 0, sWidth = width, sHeight = height;

        if (width > height) {
            sx = (width - height) / 2;
            sWidth = sHeight = height;
        } else if (height > width) {
            sy = (height - width) / 2;
            sWidth = sHeight = width;
        }

        ctx.drawImage(placeholder, sx, sy, sWidth, sHeight, 0, 0, canvasSize, canvasSize);
    };

    placeholder.src = './img/user-icon.png';
}