import { Link } from 'react-router-dom';
import { PERSONAL_DATA_POLICY_SLUG } from '../constants/legal.js';

export default function PersonalDataConsent({
  checked,
  onChange,
  error,
  policySlug = PERSONAL_DATA_POLICY_SLUG,
  className = '',
}) {
  return (
    <div className={className}>
      <label className="flex items-start text-sm text-gray-600 space-x-2">
        <input
          type="checkbox"
          name="personal_data_consent"
          value="1"
          checked={checked}
          onChange={onChange}
          aria-required="true"
          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span>
          Я даю согласие на{' '}
          <Link
            to={`/pages/${policySlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline"
            onClick={(e) => e.stopPropagation()}
          >
            обработку персональных данных
          </Link>{' '}
          в соответствии с пользовательским соглашением.
        </span>
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
