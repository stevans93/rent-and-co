import { useState } from 'react';
import { useLanguage } from '../context';

export default function CreateResourcePage() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{t.create.title}</h1>
      <p className="text-gray-500 mb-8">{t.create.breadcrumb}</p>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                s <= step ? 'bg-[#e85d45] text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div className={`w-24 h-1 ${s < step ? 'bg-[#e85d45]' : 'bg-gray-200'}`}></div>
            )}
          </div>
        ))}
      </div>

      <form className="bg-white rounded-xl p-8 shadow-sm max-w-3xl">
        <h2 className="text-xl font-bold mb-6">{t.create.basicInfo}</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t.create.adTitle} *</label>
            <input
              type="text"
              placeholder={t.create.enterAddress}
              className="w-full border rounded-lg px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.create.category} *</label>
            <select className="w-full border rounded-lg px-4 py-3">
              <option value="">{t.create.selectCategory}</option>
              <option value="1">{t.common.category} 1</option>
              <option value="2">{t.common.category} 2</option>
              <option value="3">{t.common.category} 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.create.description} *</label>
            <textarea
              placeholder={t.create.describeResource}
              rows={5}
              className="w-full border rounded-lg px-4 py-3"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t.create.price} *</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full border rounded-lg px-4 py-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t.create.period} *</label>
              <select className="w-full border rounded-lg px-4 py-3">
                <option value="day">{t.create.perDay}</option>
                <option value="week">{t.create.perWeek}</option>
                <option value="month">{t.create.perMonth}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.create.images}</label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-gray-500 mb-2">{t.create.dragImages}</p>
              <button
                type="button"
                className="text-[#e85d45] hover:underline"
              >
                {t.create.selectFiles}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.create.address} *</label>
            <input
              type="text"
              placeholder={t.create.enterAddress}
              className="w-full border rounded-lg px-4 py-3"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t.create.city} *</label>
              <input
                type="text"
                placeholder={t.create.city}
                className="w-full border rounded-lg px-4 py-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t.create.country} *</label>
              <input
                type="text"
                placeholder={t.create.country}
                className="w-full border rounded-lg px-4 py-3"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            className="px-6 py-3 border rounded-lg hover:bg-gray-50"
            disabled={step === 1}
          >
            {t.create.back}
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-[#e85d45] text-white rounded-lg hover:bg-[#d54d35]"
          >
            {t.create.publishAd}
          </button>
        </div>
      </form>
    </div>
  );
}
