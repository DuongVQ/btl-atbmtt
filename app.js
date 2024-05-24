// g: phần tử nguyên thủy (a)
// x: alpha
// y: beta
let p, g, x, y;

// Hàm tạo p và check true
function generateRandomPrime(bits) {
    while (true) {
        // Khởi tạo p
        let p = BigInt('0b' + Array(bits).fill(0).map(() => Math.random() > 0.5 ? '1' : '0').join(''));
        // Check p
        if (isProbablePrime(p)) {
            return p;
        }
    }
}

// Hàm triển khai millerRabinTest() kiểm tra tính nguyên tố, gán n = p
function isProbablePrime(n, k = 5) {
    // Check n = 1,2,3
    if (n <= 1n) return false;
    if (n <= 3n) return true;
    if (n % 2n === 0n || n % 3n === 0n) return false;

    let d = n - 1n;
    let r = 0n;
    // Nếu d chẵn
    while (d % 2n === 0n) {
        d /= 2n;
        r += 1n;
    }
    for (let i = 0; i < k; i++) {
        // Nếu p ko phải snt, trả về false
        if (!millerRabinTest(n, d, r)) {
            return false;
        }
    }
    return true;
}

// Hàm kiểm tra tính nguyên tố cho số lớn
function millerRabinTest(n, d, r) {
    // Chọn ngẫu nhiên a từ [2, n-2]
    const a = 2n + BigInt(Math.floor(Math.random() * (Number(n - 4n))));
    // Dùng thuật toán bp và nhân để giảm x, kiểm tra tính nguyên tố
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) return true;
    // Nếu x vẫn lớn tiếp tục dùng bp và nhân đến khi nhỏ hơn n
    for (let i = 0n; i < r - 1n; i++) {
        x = modPow(x, 2n, n);
        if (x === n - 1n) return true;
    }
    return false;
}

// Hàm thuật toán bình phương và nhân
function modPow(base, exp, mod) {
    let result = 1n;
    base = base % mod;
    while (exp > 0) {
        if (exp % 2n === 1n) {
            result = (result * base) % mod;
        }
        exp = exp >> 1n;
        base = (base * base) % mod;
    }
    return result;
}

// Hàm mở rộng Ơclit
function modInverse(a, m) {
    let m0 = m, t, q;
    let x0 = 0n, x1 = 1n;
    if (m === 1n) return 0n;
    while (a > 1n) {
        q = a / m;
        t = m;
        m = a % m;
        a = t;
        t = x0;
        x0 = x1 - q * x0;
        x1 = t;
    }
    if (x1 < 0n) x1 += m0;
    return x1;
}

// Hàm tạo khóa ngẫu nhiên
function generateKeys() {
    // Tạo số nguyên tố lớn p
    p = generateRandomPrime(256);
    // Gán giá trị nguyên thủy = 2
    g = 2n;
    x = BigInt(Math.floor(Math.random() * Number(p - 1n))) + 1n; // Private key
    y = modPow(g, x, p); // Public key

    // In giá trị khóa pub, pri
    document.getElementById('keys').innerHTML = `
Public Key: {${p.toString()}; ${g.toString()}; ${y.toString()}}

Private Key: {${x.toString()}}
    `;
}

function encrypt() {
    // gán biến
    const plaintext = document.getElementById('plaintext').value;
    if (!plaintext) {
        // biến sai, dừng
        alert("Please enter plaintext to encrypt.");
        return;
    }

    // Chuyển đổi văn bản gốc thành base64 để xử lý các ký tự đặc biệt
    const m = BigInt('0x' + Array.from(new TextEncoder().encode(plaintext)).map(byte => byte.toString(16).padStart(2, '0')).join(''));

    const k = BigInt(Math.floor(Math.random() * Number(p - 1n))) + 1n;
    const a = modPow(g, k, p);
    const b = (modPow(y, k, p) * m) % p;

    // gán kết quả
    const ciphertext = `(${a.toString()}, ${b.toString()})`;
    document.getElementById('ciphertext').innerText = `${ciphertext}`;
}

function decrypt() {
    // Nếu chưa có bản mã, thông báo
    const ciphertextInput = document.getElementById('ciphertextInput').value;
    if (!ciphertextInput) {
        alert("Please enter ciphertext to decrypt.");
        return;
    }

    // Nếu không đúng form, thông báo
    const match = ciphertextInput.match(/\((.*), (.*)\)/);
    if (!match) {
        alert("Invalid ciphertext format.");
        return;
    }

    const a = BigInt(match[1]);
    const b = BigInt(match[2]);

    const s = modPow(a, x, p);
    const m = (b * modInverse(s, p)) % p;

    // Chuyển đổi hex sang Uint8Array
    const hexString = m.toString(16).padStart(m.toString(16).length + (m.toString(16).length % 2), '0');
    const uint8Array = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const decryptedText = new TextDecoder().decode(uint8Array);

    document.getElementById('decryptedtext').innerText = `${decryptedText}`;
}

// Nút chuyển bản mã hóa sang bên giải mã
document.querySelector("#transfer").addEventListener('click', () => {
    document.getElementById('ciphertextInput').value = document.getElementById('ciphertext').value;
})

// Hàm đọc file bản rõ
function previewFile1() {
    document.getElementById('choose-enCode_plainText').addEventListener('change', function(event) {
        // Kiểm tra file
        var file = this.files[0];
        if (!file) {
            return;
        }
        // Lấy giá trị file
        var reader = new FileReader();
        reader.onload = function(event) {
            var result = reader.result;
            // Đọc văn bản thuần .txt
            if (file.type === "text/plain") {
                displayTextResult(result);
            } else {
                // Đọc văn bản .docx
                var arrayBuffer = result;
                mammoth.convertToHtml({arrayBuffer: arrayBuffer})
                    .then(displayHtmlResult)
                    .catch(handleError);
            }
        };
        if (file.type === "text/plain") {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    });
    function displayTextResult(result) {
        document.getElementById('plaintext').textContent = result;
    }
    function displayHtmlResult(result) {
        var cleanHtml = result.value.replace(/<\/?p[^>]*>/g, '');
        document.getElementById('plaintext').innerHTML = cleanHtml;
    }
    function handleError(err) {
        console.log(err);
        alert('An error occurred while reading the file.');
    }
}

// Hàm đọc file bản mã
function previewFile2() {
    document.getElementById('choose-deCode_codeText').addEventListener('change', function(event) {
        var file = this.files[0];
        if (!file) {
            return;
        }
        var reader = new FileReader();
        reader.onload = function(event) {
            var result = reader.result;

            if (file.type === "text/plain") {
                displayTextResult(result);
            } else {
                var arrayBuffer = result;
                mammoth.convertToHtml({arrayBuffer: arrayBuffer})
                    .then(displayHtmlResult)
                    .catch(handleError);
            }
        };
        if (file.type === "text/plain") {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    });

    function displayTextResult(result) {
        document.getElementById('ciphertextInput').textContent = result;
    }

    function displayHtmlResult(result) {
        var cleanHtml = result.value.replace(/<\/?p[^>]*>/g, '');
        document.getElementById('ciphertextInput').innerHTML = cleanHtml;
    }

    function handleError(err) {
        console.log(err);
        alert('An error occurred while reading the file.');
    }
}

// Hàm lưu file .txt bên mã hóa
function saveTextAsFileTXT() {
    // Lấy nội dung từ phần tử <textarea>
    let textToSave = document.getElementById("ciphertext").value;

    // Tạo một đối tượng Blob từ nội dung văn bản
    let blob = new Blob([textToSave], { type: "text/plain;charset=utf-8" });

    // Tạo URL đặc biệt cho đối tượng Blob
    let url = URL.createObjectURL(blob);

    // Tạo một phần tử <a> ẩn
    let a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "myFile.txt";

    // Thêm phần tử <a> vào DOM
    document.body.appendChild(a);

    // Simulate click phần tử <a> để tải về tệp tin
    a.click();

    // Xóa phần tử <a> đã thêm vào DOM
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Nút thực hiện lưu file .txt bên mã hóa
document.querySelector("#save_codeTXT-E").addEventListener('click', function() {
    saveTextAsFileTXT();
})

// Hàm lưu file .doc bên mã hóa
function saveTextAsFileDOC() {
    let textToSave = document.getElementById("ciphertext").value;
    let blob = new Blob([textToSave], { type: "text/plain;charset=utf-8" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "myFile.doc";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Nút thực hiện lưu file .doc bên mã hóa
document.querySelector("#save_codeDOC-E").addEventListener('click', function() {
    saveTextAsFileDOC();
})

// Hàm lưu file .txt bên giải mã
function saveTextAsFileTXT2() {
    let textToSave = document.getElementById("decryptedtext").value;
    let blob = new Blob([textToSave], { type: "text/plain;charset=utf-8" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "myFile.txt"; 
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Nút thực hiện lưu file .txt bên giải mã
document.querySelector("#save_plainTXT").addEventListener('click', function() {
    saveTextAsFileTXT2();
})

// Hàm lưu file .doc bên giải mã
function saveTextAsFileDOC2() {
    let textToSave = document.getElementById("decryptedtext").value;
    let blob = new Blob([textToSave], { type: "text/plain;charset=utf-8" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "myFile.doc";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Nút thực hiện lưu file .doc bên giải mã
document.querySelector("#save_plainDOC").addEventListener('click', function() {
    saveTextAsFileDOC2();
})