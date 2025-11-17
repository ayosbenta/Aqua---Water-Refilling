
import React from 'react';

const GOOGLE_SHEET_ID = '1bPiF0ILJrZV8jT1WWvBfGUNcx855MEE15CiUMr6D0Ig';
const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit`;

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm my-2">
        <code>{children}</code>
    </pre>
);

const InstructionStep: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
            <span className="bg-primary text-white rounded-full h-8 w-8 inline-flex items-center justify-center mr-3 flex-shrink-0">{number}</span>
            {title}
        </h3>
        <div className="pl-11 border-l-2 border-gray-200 ml-4 pb-4">
            <div className="text-gray-600 space-y-2">
                {children}
            </div>
        </div>
    </div>
);

const SetupGuide: React.FC = () => {
    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl bg-white p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8">
                    <svg className="mx-auto h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <h1 className="mt-4 text-3xl font-extrabold text-primary-dark">Final Step: Connect Your Backend</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        To make the app work, you need to link it to your Google Sheet by deploying the provided script.
                    </p>
                </div>

                <div className="space-y-6">
                    <InstructionStep number={1} title="Open Your Google Sheet & Apps Script">
                        <p>Go to your Google Sheet. Based on your last message, your Sheet ID appears to be:</p>
                        <p className="font-mono bg-gray-100 p-2 rounded text-sm"><strong>{GOOGLE_SHEET_ID}</strong></p>
                        <a href={GOOGLE_SHEET_URL} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 text-white px-4 py-2 rounded-md my-2 hover:bg-green-700 text-sm font-semibold">Open Google Sheet</a>
                        <p>Inside the sheet, click on <strong>Extensions</strong> &gt; <strong>Apps Script</strong>.</p>
                    </InstructionStep>

                    <InstructionStep number={2} title="Paste the Backend Code">
                        <p>A new script editor tab will open. Delete any existing code in the <code>Code.gs</code> file.</p>
                        <p>Copy the <strong>entire content</strong> from the file <code>scripts/Code.gs.js</code> in this project and paste it into the Apps Script editor.</p>
                    </InstructionStep>

                    <InstructionStep number={3} title="Deploy the Script">
                        <p>Click the blue <strong>Deploy</strong> button in the top-right corner, then select <strong>New deployment</strong>.</p>
                        <p>Click the gear icon <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 inline-block mx-1"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg> next to "Select type" and choose <strong>Web app</strong>.</p>
                        <p>Under "Configuration", make sure to set <strong>"Who has access"</strong> to <strong>"Anyone"</strong>. This is very important for the app to connect.</p>
                        <p>Click <strong>Deploy</strong>. You may need to authorize the script by allowing Google permissions.</p>
                    </InstructionStep>

                    <InstructionStep number={4} title="Get the Web App URL">
                        <p>After deploying, a new window will appear with your <strong>Web app URL</strong>. It will look something like this:</p>
                        <CodeBlock>https://script.google.com/macros/s/AKfyc.../exec</CodeBlock>
                        <p>Click the <strong>Copy</strong> button to copy this URL.</p>
                    </InstructionStep>
                    
                    <InstructionStep number={5} title="Update the Frontend Code">
                        <p>Finally, open the <code>App.tsx</code> file in this project.</p>
                        <p>Find the line with the <code>APP_SCRIPT_URL</code> constant and paste your copied URL there, replacing the placeholder text.</p>
                        <CodeBlock>
                            {`const APP_SCRIPT_URL = 'PASTE_YOUR_NEW_WEB_APP_URL_HERE';`}
                        </CodeBlock>
                        <p>Once you save the file with the correct URL, this setup page will disappear and your app will load.</p>
                    </InstructionStep>
                </div>
            </div>
        </div>
    );
};

export default SetupGuide;
