export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-pink-600 mb-4">
          BeeneStyle
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          LINE AI ヘルスケアシステム
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            サービス一覧
          </h2>
          <ul className="text-left text-gray-600 space-y-3">
            <li className="flex items-center gap-2">
              <span className="text-pink-500">&#x2714;</span>
              AI肌診断
            </li>
            <li className="flex items-center gap-2">
              <span className="text-pink-500">&#x2714;</span>
              AI健康体重診断
            </li>
            <li className="flex items-center gap-2">
              <span className="text-pink-500">&#x2714;</span>
              AI食事解析
            </li>
            <li className="flex items-center gap-2">
              <span className="text-pink-500">&#x2714;</span>
              ダイエット日報
            </li>
            <li className="flex items-center gap-2">
              <span className="text-pink-500">&#x2714;</span>
              予約管理
            </li>
            <li className="flex items-center gap-2">
              <span className="text-pink-500">&#x2714;</span>
              FAQチャットボット
            </li>
          </ul>
        </div>

        <p className="text-sm text-gray-400">
          Powered by Google Gemini + LINE Messaging API
        </p>
      </div>
    </div>
  );
}
