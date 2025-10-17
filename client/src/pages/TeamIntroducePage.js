import React from 'react';
import { motion } from 'framer-motion';

const TeamIntroducePage = () => {
  const teamMembers = [
    {
      id: 1,
      name: '김영헌',
      role: 'CEO',
      image: '/images/team_introduce_page/yh.webp',
      organization: 'KAIST GGGS 석사',
      experience: [
        '전기및전자 CILAB 연구실 출신',
        '딥페이크 탐지 논문 7편',
        '(4편 주저자, 3편 공저자)'
      ]
    },
    {
      id: 2,
      name: '이준명',
      role: 'AI ENGINEER',
      image: '/images/team_introduce_page/lee_jun_myeong.webp',
      organization: 'KAIST 전산학부 석사',
      experience: [
        '전산학부 NLPCL 연구실 출신',
        '컴퓨터 비전 논문 4편',
        '(1편 주저자, 3편 공저자)'
      ]
    },
    {
      id: 3,
      name: '양희찬',
      role: 'SW ENGINEER',
      image: '/images/team_introduce_page/yang_hee_chan.webp',
      organization: 'KAIST 전산학부 석사',
      experience: [
        '전산학부 SWTV 연구실 출신',
        '소프트웨어 개발 전문',
        '(협업기업: LIG 넥스원, UN)'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              팀 소개
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              딥스피어 AI를 이끌어가는 전문가들을 소개합니다.
            </p>
          </div>

          {/* Team Members Grid */}
          <div className="grid md:grid-cols-3 gap-12 mt-16">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                {/* Profile Image with Logo Badge */}
                <div className="relative inline-block mb-6">
                  <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-200 mx-auto">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/192x192?text=' + member.name;
                      }}
                    />
                  </div>
                </div>

                {/* Member Info */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="font-bold text-lg mb-4" style={{ color: '#62A7DE' }}>
                  {member.role}
                </p>
                
                {/* Organization & Experience */}
                <div className="space-y-2 text-gray-600">
                  <p className="font-medium text-gray-700">{member.organization}</p>
                  {member.experience.map((exp, idx) => (
                    <p key={idx} className="text-sm">{exp}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* History of Company */}
          <div className="mt-32">
            <div className="text-center mb-16">
              <h2 className="font-bold text-sm tracking-wider uppercase mb-4" style={{ color: '#62A7DE' }}>
                HISTORY
              </h2>
              <div className="w-20 h-1 mx-auto" style={{ backgroundColor: '#62A7DE' }}></div>
            </div>

            {/* Timeline Grid */}
            <div className="max-w-2xl mx-auto">
              {/* 2025 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-center mb-8">
                  <h3 className="text-4xl font-bold text-gray-900 mb-2">2025</h3>
                  <div className="w-12 h-1 mx-auto" style={{ backgroundColor: '#62A7DE' }}></div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <p className="font-bold text-sm mb-2" style={{ color: '#62A7DE' }}>8월</p>
                    <p className="text-gray-800 leading-relaxed">
                      딥스피어 AI 팀 결성
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <p className="font-bold text-sm mb-2" style={{ color: '#62A7DE' }}>9월</p>
                    <p className="text-gray-800 leading-relaxed">
                      E5 KAIST 창업경진대회 본선진출 (TOP 3팀 선정 / 상금 50만원)
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <p className="font-bold text-sm mb-2" style={{ color: '#62A7DE' }}>10월</p>
                    <p className="text-gray-800 leading-relaxed">
                      플스포컴퍼니 청년창업지원 선정 (700만원 지원)
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default TeamIntroducePage;
