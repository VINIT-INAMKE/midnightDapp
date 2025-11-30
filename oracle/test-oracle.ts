import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import * as readline from 'readline';

async function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }));
}

async function main() {
    try {
        const zipPath = path.join(process.cwd(), 'offlineaadhaar20251129115343449.zip');
        if (!fs.existsSync(zipPath)) {
            console.error("ZIP file not found:", zipPath);
            process.exit(1);
        }

        const password = await askQuestion("Enter the ZIP password: ");

        const zipBuffer = fs.readFileSync(zipPath);

        // Send Request
        const form = new FormData();
        form.append('file', zipBuffer, { filename: 'aadhaar.zip', contentType: 'application/zip' });
        form.append('password', password);

        console.log("Sending request to Oracle Server...");
        const response = await axios.post('http://localhost:3000/verify-aadhaar', form, {
            headers: {
                ...form.getHeaders()
            }
        });

        const json = response.data;
        console.log("Response:", JSON.stringify(json, null, 2));
        if (json.student_credential && json.issuer_signature) {
            console.log("✅ Test Passed: Received Witness JSON");
        } else {
            console.error("❌ Test Failed: Invalid Response Format");
        }

    } catch (e) {
        if (axios.isAxiosError(e)) {
            console.error("❌ Request Failed:", e.response?.status, e.response?.data);
        } else {
            console.error("Test Error:", e);
        }
    }
}

main();
