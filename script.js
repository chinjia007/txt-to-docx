const dropZone = document.getElementById('dropZone');
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.multiple = true;
fileInput.accept = '.txt';
fileInput.style.display = 'none';

document.body.appendChild(fileInput);

let files = [];

// 拖放事件处理
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#4A47FF';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#6C63FF';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
});

// 点击事件处理
dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = '';
});

function handleFiles(newFiles) {
    const validFiles = Array.from(newFiles).filter(file => {
        if (!file.name.endsWith('.txt')) {
            alert('仅支持TXT文件');
            return false;
        }
        return true;
    });

    if (files.length + validFiles.length > 5) {
        alert('最多上传5个文件');
        files = [];
        updateFileList();
        return;
    }

    files = [...files, ...validFiles].slice(0, 5);
    updateFileList();
}

function updateFileList() {
    document.getElementById('fileCount').textContent = files.length;
    const fileList = document.getElementById('fileList');
    
    fileList.innerHTML = files.map(file => `
        <div class="file-list-item">
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
        </div>
    `).join('');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 添加转换按钮事件监听
document.getElementById('convertBtn').addEventListener('click', async () => {
    if (files.length === 0) {
        alert('请先上传TXT文件');
        return;
    }

    try {
        // 逐个生成并下载DOCX文件
        files.forEach(async (file) => {
            try {
                const text = await readFileAsync(file);
                const doc = new docx.Document({
                    sections: [{
                        children: [
                            new docx.Paragraph({
                                children: [
                                    new docx.TextRun({
                                        text: text,
                                        font: '微软雅黑',
                                        size: 24
                                    })
                                ]
                            })
                        ]
                    }]
                });

                const blob = await docx.Packer.toBlob(doc);
                saveAs(blob, file.name.replace(/\.txt$/i, '.docx'));
                
                // 更新转换状态
                const statusDiv = document.getElementById('conversionStatus');
                statusDiv.innerHTML += `<div>${file.name} 转换完成，请保存到原文件夹</div>`;
                statusDiv.scrollTop = statusDiv.scrollHeight;
            } catch (error) {
                console.error(`${file.name} 转换失败:`, error);
                alert(`${file.name} 转换失败，请重试`);
            }
        });
        
        alert('开始逐个下载文件，请将文件保存到原始txt所在的文件夹');
    } catch (error) {
        console.error('转换失败:', error);
        alert('文件转换失败，请重试');
    }
});

function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}