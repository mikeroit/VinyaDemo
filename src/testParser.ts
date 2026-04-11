import { parseLeadFromText } from "./parser.js";

const sampleEmail = `
Name: John Smith
Email: john@example.com
Phone: 555-123-4567
Source: Zillow
Message: Interested in a 3 bed home.
`;

const parsed = parseLeadFromText(sampleEmail);

console.log(JSON.stringify(parsed, null, 2));