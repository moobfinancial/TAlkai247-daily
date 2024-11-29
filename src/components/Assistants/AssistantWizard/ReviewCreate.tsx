import React from 'react';

interface ReviewCreateProps {
  formData: any;
  onBack: () => void;
  onSubmit: () => void;
}

export default function ReviewCreate({ formData, onBack, onSubmit }: ReviewCreateProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-700 p-6 rounded-lg">
        <h3 className="text-white font-medium mb-4">Assistant Details</h3>
        <div className="space-y-4">
          <div>
            <span className="text-gray-400">Name:</span>
            <p className="text-white">{formData.name}</p>
          </div>
          <div>
            <span className="text-gray-400">First Message:</span>
            <p className="text-white">{formData.firstMessage}</p>
          </div>
          <div>
            <span className="text-gray-400">System Prompt:</span>
            <p className="text-white">{formData.systemPrompt}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-700 p-6 rounded-lg">
        <h3 className="text-white font-medium mb-4">Selected Tools</h3>
        <div className="space-y-2">
          {formData.tools.map((tool: any) => (
            <div key={tool.id} className="text-white">
              • {tool.id}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-400 hover:text-white"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Create Assistant
        </button>
      </div>
    </div>
  );
}