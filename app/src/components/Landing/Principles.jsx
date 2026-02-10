function Principles() {
  const principles = [
    {
      emoji: '🧠',
      title: 'Think Critically',
      description: 'Question assumptions, analyze information, and develop your own viewpoint on technology and AI.',
    },
    {
      emoji: '🎨',
      title: 'Create & Build',
      description: 'Use AI as a tool to bring your ideas to life. Learn by doing, experimenting, and building real projects.',
    },
    {
      emoji: '🤝',
      title: 'Ethics First',
      description: 'Understand the responsibility that comes with AI. Make ethical decisions and consider impact on others.',
    },
    {
      emoji: '🚀',
      title: 'Dream Big',
      description: 'Imagine the future you want to create. You have the power to shape how AI is used in the world.',
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl font-bold font-fredoka text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Our Core Principles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {principles.map((principle, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-cyan-400/20 rounded-2xl p-8 hover:border-cyan-400/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <span className="text-5xl">{principle.emoji}</span>
                <div>
                  <h3 className="text-2xl font-bold font-fredoka text-white mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-gray-300 font-fredoka">
                    {principle.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Principles;
