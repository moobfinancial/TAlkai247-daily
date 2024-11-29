import React from 'react';

interface CustomizeAssistantProps {
  formData: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export default function CustomizeAssistant({ formData, onNext, onBack }: CustomizeAssistantProps) {
  const [name, setName] = React.useState(formData.name || '');
  const [firstMessage, setFirstMessage] = React.useState(formData.firstMessage || '');
  const [systemPrompt, setSystemPrompt] = React.useState(formData.systemPrompt || '');

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-white mb-2">Assistant Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600"
          placeholder="Enter assistant name"
        />
      </div>

      <div>
        <label className="block text-white mb-2">First Message</label>
        <textarea
          value={firstMessage}
          onChange={(e) => setFirstMessage(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 h-32"
          placeholder="Enter the first message your assistant will say"
        />
      </div>

      <div>
        <label className="block text-white mb-2">System Prompt</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 h-48"
          placeholder="Enter the system prompt that defines your assistant's behavior"
        />
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-400 hover:text-white"
        >
          Back
        </button>
        <button
          onClick={() => onNext({ name, firstMessage, systemPrompt })}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}