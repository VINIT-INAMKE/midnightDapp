import express from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import * as crypto from 'crypto';
import { verifyAadhaarSignature } from './rsaverifier';

const app = express();
const port = 3000;

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper to calculate age
function calculateAge(dob: string): number {
    // DOB format in XML is usually DD-MM-YYYY or YYYY-MM-DD
    // Let's handle both or assume standard
    // Based on uidai.ts: const birthYear = parseInt(dob?.split('-')[2] || '2000');
    // This implies DD-MM-YYYY
    const parts = dob.split('-');
    let birthYear = 2000;
    if (parts.length === 3) {
        if (parts[0].length === 4) birthYear = parseInt(parts[0]); // YYYY-MM-DD
        else birthYear = parseInt(parts[2]); // DD-MM-YYYY
    }

    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
}

app.post('/verify-aadhaar', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const password = req.body.password;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!password) {
            return res.status(400).json({ error: 'No password provided' });
        }

        // 1. Unzip file in memory
        const zip = new AdmZip(file.buffer);
        const zipEntries = zip.getEntries();
        let xmlContent: string | null = null;

        // Find the XML file
        for (const entry of zipEntries) {
            if (entry.entryName.endsWith('.xml')) {
                try {
                    // readAsText doesn't support password, so use readFile and convert to string
                    const buffer = zip.readFile(entry, password);
                    if (buffer) {
                        xmlContent = buffer.toString('utf8');
                    } else {
                        throw new Error('Failed to read encrypted file');
                    }
                } catch (e) {
                    return res.status(401).json({ error: 'Incorrect password or failed to read zip' });
                }
                break;
            }
        }

        if (!xmlContent) {
            return res.status(400).json({ error: 'No XML file found in ZIP' });
        }

        // 2. Verify XML Signature
        console.log("Verifying Aadhaar XML signature...");
        const isValidSignature = await verifyAadhaarSignature(xmlContent);

        if (!isValidSignature) {
            return res.status(400).json({ error: 'Invalid Aadhaar XML Signature' });
        }

        // 3. Parse XML for Data
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
        const jsonObj = parser.parse(xmlContent);

        // Handle different XML structures if needed, but following uidai.ts
        const uidData = jsonObj.OfflinePaperlessKyc?.UidData;

        if (!uidData) {
            return res.status(400).json({ error: 'Invalid XML structure: UidData not found' });
        }

        const dob = uidData.Poi?.dob;
        const mobileHashRaw = uidData.Poi?.m;

        if (!dob || !mobileHashRaw) {
            return res.status(400).json({ error: 'Missing DOB or Mobile Hash in XML' });
        }

        // Calculate Mobile Hash (SHA256 of the value in XML if it's not already hashed? 
        // uidai.ts does: const hashed = crypto.createHash('sha256').update(uidData.Poi.m).digest('hex');
        const mobileHash = crypto.createHash('sha256').update(mobileHashRaw).digest('hex');

        // 4. Check Eligibility
        const age = calculateAge(dob);
        const isEligible = age >= 18;

        // 5. Sign Data (Issuer/Bridge Logic)
        // Generate ephemeral key for this session (in a real oracle, this would be a persistent private key)
        const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');

        const dataToSign = Buffer.from(mobileHash);
        const signature = crypto.sign(null, dataToSign, privateKey);
        const bridgeSignature = signature.toString('hex');

        // 6. Construct Witness
        const witness = {
            student_credential: {
                id: mobileHash,
                is_eligible: isEligible,
                salt: crypto.randomBytes(32).toString('hex')
            },
            issuer_signature: bridgeSignature
        };

        // Cleanup (variables will be GC'd)

        return res.json(witness);

    } catch (error) {
        console.error("Error processing request:", error);
        return res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
});

app.listen(port, () => {
    console.log(`Oracle Server listening at http://localhost:${port}`);
});
