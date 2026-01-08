const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const fileList = document.getElementById('fileList');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');

let images = [];

uploadArea.addEventListener('click', () => imageInput.click());

uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.style.background = 'rgba(56,189,248,0.15)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.background = '';
});

uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.style.background = '';
    handleFiles(e.dataTransfer.files);
});

imageInput.addEventListener('change', () => {
    handleFiles(imageInput.files);
});

clearBtn.addEventListener('click', () => {
    images = [];
    fileList.innerHTML = '';
    generateBtn.disabled = true;
});

generateBtn.addEventListener('click', generatePDF);

function handleFiles(files) {
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            images.push(file);
        }
    }
    updateFileList();
}

function updateFileList() {
    fileList.innerHTML = '';
    images.forEach((img, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${img.name}`;
        fileList.appendChild(li);
    });
    generateBtn.disabled = images.length === 0;
}

async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    for (let i = 0; i < images.length; i++) {
        const imgData = await readFileAsDataURL(images[i]);

        const img = new Image();
        img.src = imgData;

        await new Promise(resolve => {
            img.onload = () => {
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                const ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
                const width = img.width * ratio;
                const height = img.height * ratio;

                const x = (pageWidth - width) / 2;
                const y = (pageHeight - height) / 2;

                if (i > 0) pdf.addPage();
                pdf.addImage(img, 'JPEG', x, y, width, height);
                resolve();
            };
        });
    }

    pdf.save('imagens_para_pdf.pdf');
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
