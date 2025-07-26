'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function HomePage() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <main
      className="min-h-screen w-full bg-cover bg-center relative text-white"
      style={{
        backgroundImage: "url('/bg-gradient.jpg')",
      }}
    >
      {/* 公司介紹文字區塊 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl mx-auto px-6 py-24 text-white"
      >
        <h1 className="text-4xl font-bold mb-6">關於彩意企業有限公司</h1>
        <p className="text-lg mb-4 leading-relaxed">
          從一張輸出，到一場活動的整體呈現，彩意企業有限公司致力於提供快速、可靠的大圖輸出與會場佈置服務，協助設計公司、公關公司及各類活動團隊，將創意確實轉化為現場效果。
        </p>
        <p className="text-lg mb-4 leading-relaxed">
          我們深知活動製作是一場與時間賽跑的任務，因此在流程管理與製作品質上，皆以「效率」與「穩定」為核心，建立出高信賴的合作默契。從初步視覺輸出、材質建議、現場勘查，到實地施工、完工收尾，每一個環節都經過專業團隊細心把關。
        </p>
        <p className="text-lg leading-relaxed">
          彩意擁有豐富的活動與展覽執行經驗，熟悉各大展場及活動場地作業流程，能靈活因應各類空間限制與時間壓力，為合作夥伴創造省心、省時、省力的合作體驗。無論是快閃活動、產品發表、年度尾牙，還是國際級展會，我們都致力於讓每一次現場呈現，成為品牌與觀眾之間最有感的接觸點。
        </p>
      </motion.div>

      {/* 四大服務特色區塊 */}
      <section className="relative min-h-[48px] z-10 max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            icon: '/icon_quality.png',
            title: '高品質製作',
            desc: '嚴謹控管每道流程，確保每件作品品質穩定。',
          },
          {
            icon: '/icon_efficiency.png',
            title: '效率管理',
            desc: '流程精簡、時效迅速，確保專案如期交付。',
          },
          {
            icon: '/icon_support.png',
            title: '專業支援',
            desc: '專案經理協助跟進，隨時提供最佳解決方案。',
          },
          {
            icon: '/icon_flexibility.png',
            title: '彈性因應',
            desc: '面對不同空間與時間限制，靈活配置製作方案。',
          },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center px-2">
            <Image src={item.icon} alt={item.title} width={48} height={48} className="mb-4" />
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-base text-gray-200 leading-relaxed">
              {item.desc.split('，').map((part, index, arr) => (
                <span key={index}>
                  {part}
                  {index < arr.length - 1 && '，'}
                  {index < arr.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        ))}
      </section>

      {/* 右下角聯絡按鈕 */}
      <button
        onClick={() => setIsContactOpen(!isContactOpen)}
        className="fixed bottom-6 right-6 z-30 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full shadow-lg transition"
      >
        聯絡我們
      </button>

      {/* 彈出視窗（右下角） */}
      {isContactOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 right-6 z-30 w-72 bg-white text-black rounded-xl shadow-2xl p-4"
        >
          <h2 className="text-lg font-bold mb-2">聯絡資訊</h2>
          <p className="mb-1">📞 電話：02-2214-5786</p>
          <p className="mb-1">✉️ 信箱：mail@superprint.tw</p>
          <p>📍 地址：新北市新店區富貴街23巷2號1樓</p>
        </motion.div>
      )}
    </main>
  );
}
