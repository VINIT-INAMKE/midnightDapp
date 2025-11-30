import * as fs from 'fs';
import * as crypto from 'crypto';

const TRUSTED_UIDAI_CERT = `MIIHwjCCBqqgAwIBAgIEU5laMzANBgkqhkiG9w0BAQsFADCB/DELMAkGA1UEBhMCSU4xQTA/BgNV
BAoTOEd1amFyYXQgTmFybWFkYSBWYWxsZXkgRmVydGlsaXplcnMgYW5kIENoZW1pY2FscyBMaW1p
dGVkMR0wGwYDVQQLExRDZXJ0aWZ5aW5nIEF1dGhvcml0eTEPMA0GA1UEERMGMzgwMDU0MRAwDgYD
VQQIEwdHdWphcmF0MSYwJAYDVQQJEx1Cb2Rha2RldiwgUyBHIFJvYWQsIEFobWVkYWJhZDEcMBoG
A1UEMxMTMzAxLCBHTkZDIEluZm90b3dlcjEiMCAGA1UEAxMZKG4pQ29kZSBTb2x1dGlvbnMgQ0Eg
MjAxNDAeFw0yMTAyMjYxMTU0MjRaFw0yNDAyMjcwMDI3MTFaMIHdMQswCQYDVQQGEwJJTjExMC8G
A1UEChMoVU5JUVVFIElERU5USUZJQ0FUSU9OIEFVVEhPUklUWSBPRiBJTkRJQTEPMA0GA1UEERMG
MTEwMDAxMQ4wDAYDVQQIEwVEZWxoaTEbMBkGA1UECRMSQkVISU5EIEtBTEkgTUFORElSMSQwIgYD
VQQzExtBQURIQVIgSFEgQkFOR0xBIFNBSElCIFJPQUQxNzA1BgNVBAMTLkRTIFVOSVFVRSBJREVO
VElGSUNBVElPTiBBVVRIT1JJVFkgT0YgSU5ESUEgMDUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAw
ggEKAoIBAQCiciwOXy3lunB+2T8DbsKx8LlVkyOQ+swPC8vyDIChXAiLSIaGa3LrJasL9Vov4Gtp
7b1cyDt0x3CdshQebAfGi834WdPa9/P87SQdByBV3BVIhHS0XCyYL6lUqlKqb/+ySBhhxlCF2Etk
FY6fQ9nzXKabSM6TAFIhAqTK4JO//UdLCNMtHQQG9of35VvSJqI4S/WKQcOEw5dPHHxRFYGckm3j
rfPsu5kExIbx9dUwOXe+pjWENnMptcFor9yVEhcx9/SNQ6988x9pseO755Sdx6ixDAvd66ur3r6g
dqHPgWat8GqKQd7fFDv/g129K9W7C2HSRywjSm1EEbybU2CVAgMBAAGjggNnMIIDYzAOBgNVHQ8B
Af8EBAMCBsAwKgYDVR0lBCMwIQYIKwYBBQUHAwQGCisGAQQBgjcKAwwGCSqGSIb3LwEBBTCCAQIG
A1UdIASB+jCB9zCBhgYGYIJkZAICMHwwegYIKwYBBQUHAgIwbgxsQ2xhc3MgMiBjZXJ0aWZpY2F0
ZXMgYXJlIHVzZWQgZm9yIGZvcm0gc2lnbmluZywgZm9ybSBhdXRoZW50aWNhdGlvbiBhbmQgc2ln
bmluZyBvdGhlciBsb3cgcmlzayB0cmFuc2FjdGlvbnMuMGwGBmCCZGQKATBiMGAGCCsGAQUFBwIC
MFQMUlRoaXMgY2VydGlmaWNhdGUgcHJvdmlkZXMgaGlnaGVyIGxldmVsIG9mIGFzc3VyYW5jZSBm
b3IgZG9jdW1lbnQgc2lnbmluZyBmdW5jdGlvbi4wDAYDVR0TAQH/BAIwADAjBgNVHREEHDAagRhy
YWh1bC5rdW1hckB1aWRhaS5uZXQuaW4wggFuBgNVHR8EggFlMIIBYTCCAR6gggEaoIIBFqSCARIw
ggEOMQswCQYDVQQGEwJJTjFBMD8GA1UEChM4R3VqYXJhdCBOYXJtYWRhIFZhbGxleSBGZXJ0aWxp
emVycyBhbmQgQ2hlbWljYWxzIExpbWl0ZWQxHTAbBgNVBAsTFENlcnRpZnlpbmcgQXV0aG9yaXR5
MQ8wDQYDVQQREwYzODAwNTQxEDAOBgNVBAgTB0d1amFyYXQxJjAkBgNVBAkTHUJvZGFrZGV2LCBT
IEcgUm9hZCwgQWhtZWRhYmFkMRwwGgYDVQQzExMzMDEsIEdORkMgSW5mb3Rvd2VyMSIwIAYDVQQD
ExkobilDb2RlIFNvbHV0aW9ucyBDQSAyMDE0MRAwDgYDVQQDEwdDUkw1Njk0MD2gO6A5hjdodHRw
czovL3d3dy5uY29kZXNvbHV0aW9ucy5jb20vcmVwb3NpdG9yeS9uY29kZWNhMTQuY3JsMCsGA1Ud
EAQkMCKADzIwMjEwMjI2MTE1NDI0WoEPMjAyNDAyMjcwMDI3MTFaMBMGA1UdIwQMMAqACE0HvvGe
nfu9MB0GA1UdDgQWBBTpS5Cfqf2zdwqjupLAqMwk/bqX9DAZBgkqhkiG9n0HQQAEDDAKGwRWOC4x
AwIDKDANBgkqhkiG9w0BAQsFAAOCAQEAbTlOC4sonzb44+u5+VZ3wGz3OFg0uJGsufbBu5efh7kO
2DlYnx7okdEfayQQs6AUzDvsH1yBSBjsaZo3fwBgQUIMaNKdKSrRI0eOTDqilizldHqj113f4eUz
U2j4okcNSF7TxQWMjxwyM86QsQ6vxZK7arhBhVjwp443+pxfSIdFUu428K6yH4JBGhZSzWuqD6GN
hOhDzS+sS23MkwHFq0GX4erhVfN/W7XLeSjzF4zmjg+O77vTySCNe2VRYDrfFS8EAOcO4q7szc7+
6xdg8RlgzoZHoRG/GqUp9inpJUn7OIzhHi2e8MllaMdtXo0nbr150tMe8ZSvY2fMiTCY1w==`;

interface VerificationData {
    signatureValue: string;
    x509Certificate: string;
    digestValue: string;
    signedData: string;
}

function extractXMLContent(xml: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1] : null;
}

function cleanBase64(text: string): string {
    return text
        .replace(/&#13;/g, '')
        .replace(/\s/g, '')
        .trim();
}

function canonicalizeXML(xml: string): string {
    return xml
        .replace(/\r\n/g, '\n')
        .replace(/&#13;/g, '\n')
        .replace(/>\s+</g, '><')
        .replace(/<([a-zA-Z0-9:]+)([^>]*?)\/>/g, '<$1$2></$1>') // Expand empty tags
        .trim();
}

function extractVerificationData(xmlContent: string): VerificationData | null {
    try {
        // Extract SignatureValue
        const signatureValueRaw = extractXMLContent(xmlContent, 'SignatureValue');
        if (!signatureValueRaw) {
            console.error('❌ SignatureValue not found');
            return null;
        }
        const signatureValue = cleanBase64(signatureValueRaw);

        // Extract X509Certificate
        const x509CertRaw = extractXMLContent(xmlContent, 'X509Certificate');
        if (!x509CertRaw) {
            console.error('❌ X509Certificate not found');
            return null;
        }
        const x509Certificate = cleanBase64(x509CertRaw);

        // Extract DigestValue from Reference
        const digestValueRaw = extractXMLContent(xmlContent, 'DigestValue');
        if (!digestValueRaw) {
            console.error('❌ DigestValue not found');
            return null;
        }
        const digestValue = cleanBase64(digestValueRaw);

        // Extract OfflinePaperlessKyc attributes
        const rootMatch = xmlContent.match(/<OfflinePaperlessKyc([^>]*)>/);
        if (!rootMatch) {
            console.error('❌ OfflinePaperlessKyc tag not found');
            return null;
        }
        const rootAttrs = rootMatch[1];

        // Extract UidData (the signed content)
        const uidDataRaw = extractXMLContent(xmlContent, 'UidData');
        if (!uidDataRaw) {
            console.error('❌ UidData not found');
            return null;
        }

        const signedData = canonicalizeXML(`<OfflinePaperlessKyc${rootAttrs}><UidData>${uidDataRaw}</UidData></OfflinePaperlessKyc>`);

        return {
            signatureValue,
            x509Certificate,
            digestValue,
            signedData
        };
    } catch (error) {
        console.error('❌ Error extracting verification data:', error);
        return null;
    }
}

export async function verifyAadhaarSignature(xmlContent: string): Promise<boolean> {
    try {
        // Extract all verification data
        const data = extractVerificationData(xmlContent);
        if (!data) {
            console.error('❌ Failed to extract verification data');
            return false;
        }

        const { signatureValue, x509Certificate, digestValue, signedData } = data;

        // 0. Certificate Pinning Check
        const normalize = (s: string) => s.replace(/[\s\n\r]/g, ''); // Normalize by removing all whitespace and newlines
        if (normalize(x509Certificate) !== normalize(TRUSTED_UIDAI_CERT)) {
            console.error("❌ Certificate Mismatch! The XML is not signed by the expected UIDAI key.");
            return false;
        }
        console.log("✅ Certificate Match: XML is signed by the trusted UIDAI key.");

        console.log('=== Step 1: Extract Data ===');
        console.log(`✓ Signature Value: ${signatureValue.substring(0, 50)}...`);
        console.log(`✓ X509 Certificate: ${x509Certificate.substring(0, 50)}...`);
        console.log(`✓ Digest Value (base64): ${digestValue}`);
        console.log(`✓ Signed Data Length: ${signedData.length} bytes\n`);

        // Step 1: Calculate SHA256 hash of the signed data
        console.log('=== Step 2: Calculate Hash of Signed Data ===');
        const calculatedDigest = crypto
            .createHash('sha256')
            .update(signedData, 'utf-8')
            .digest('base64');

        console.log(`Expected Digest (from XML):  ${digestValue}`);
        console.log(`Calculated Digest (SHA256):  ${calculatedDigest}`);

        const digestMatch = calculatedDigest === digestValue;
        console.log(`Digest Match: ${digestMatch ? '✓ YES' : '✗ NO'}\n`);

        if (!digestMatch) {
            console.error('❌ Digest mismatch! The signed data has been modified.');
            return false;
        }

        // Step 2: Extract SignedInfo and canonicalize it
        console.log('=== Step 3: Extract and Canonicalize SignedInfo ===');
        const signedInfoRaw = extractXMLContent(xmlContent, 'SignedInfo');
        if (!signedInfoRaw) {
            console.error('❌ SignedInfo not found');
            return false;
        }

        // Add the namespace to SignedInfo as it inherits it from Signature
        const signedInfo = `<SignedInfo xmlns="http://www.w3.org/2000/09/xmldsig#">${canonicalizeXML(signedInfoRaw)}</SignedInfo>`;
        console.log(`✓ SignedInfo canonicalized`);
        console.log(`  Length: ${signedInfo.length} bytes\n`);

        // Step 3: Calculate SHA1 hash of SignedInfo (used for RSA signature)
        console.log('=== Step 4: Verify RSA Signature ===');
        const signedInfoDigest = crypto
            .createHash('sha1')
            .update(signedInfo, 'utf-8')
            .digest();

        console.log(`✓ SignedInfo SHA1 Hash calculated`);
        console.log(`  Hash Length: ${signedInfoDigest.length} bytes\n`);

        // Step 4: Extract public key from certificate and verify signature
        console.log('=== Step 5: Verify with Public Key ===');
        const certPEM = `-----BEGIN CERTIFICATE-----\n${x509Certificate}\n-----END CERTIFICATE-----`;

        const verifier = crypto.createVerify('RSA-SHA1');
        verifier.update(signedInfo, 'utf-8');

        const signatureBuffer = Buffer.from(signatureValue, 'base64');
        const isSignatureValid = verifier.verify(certPEM, signatureBuffer);

        console.log(`Signature Buffer Length: ${signatureBuffer.length} bytes`);
        console.log(`RSA-SHA1 Verification: ${isSignatureValid ? '✓ PASSED' : '✗ FAILED'}\n`);

        // Final result
        console.log('=== Summary ===');
        console.log(`1. Data Integrity (SHA256 Digest): ${digestMatch ? '✓ VALID' : '✗ INVALID'}`);
        console.log(`2. Signature Authenticity (RSA-SHA1): ${isSignatureValid ? '✓ VALID' : '✗ INVALID'}`);
        console.log(`3. Certificate Issuer: UIDAI (Unique Identification Authority of India)\n`);

        const overallValid = digestMatch && isSignatureValid;
        return overallValid;
    } catch (error) {
        console.error('❌ Error during verification:', error instanceof Error ? error.message : String(error));
        if (error instanceof Error && error.stack) {
            console.error('Stack:', error.stack);
        }
        return false;
    }
}