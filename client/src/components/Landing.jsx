import Icon from './Icon'

export default function Landing() {
  return (
    <div className="landing" id="home">
      <header className="landing-nav wrap">
        <a href="#home" className="brand"><span className="brand-mark">s.</span>studyspace<span className="brand-period">®</span></a>
        <nav aria-label="Website navigation"><a href="#features">The idea</a><a href="#how-it-works">How it works</a></nav>
        <a className="button button-dark small" href="#dashboard">Open planner <Icon name="arrow" size={17} /></a>
      </header>
      <main>
        <section className="landing-hero wrap">
          <div className="hero-copy">
            <p className="eyebrow"><span className="live-dot" /> A LITTLE STRUCTURE. A LOT OF POSSIBILITY.</p>
            <h1>Big goals.<br />Small steps.<br /><span>Your space.</span></h1>
            <p className="hero-description">Give your deadlines, ideas, and late-night ambitions a place to land. Make a plan. Find your focus. Go do your thing.</p>
            <div className="hero-actions"><a className="button button-orange" href="#dashboard">Let’s get to it <Icon name="arrow" /></a><span>Less mental clutter.<br />More room to learn.</span></div>
            <div className="hero-footnote"><span>01 / PLAN</span><span>02 / FOCUS</span><span>03 / MAKE PROGRESS</span></div>
          </div>
          <div className="hero-art" aria-label="Example of a day organized with Studyspace">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <span className="art-star" aria-hidden="true">✳</span>
            <div className="sample-sheet">
              <div className="sample-sheet-top"><span>THE DAILY EDIT</span><span>STUDYSPACE / EXAMPLE</span></div>
              <h2>A day,<br /><em>on purpose.</em></h2>
              <div className="sample-progress"><span>YOUR PLAN</span><span>1 OF 3 DONE</span></div>
              <div className="sample-task completed"><span className="sample-checkbox"><Icon name="check" size={13} /></span><div><strong>Read one chapter</strong><small>LITERATURE · 09:00 AM</small></div></div>
              <div className="sample-task"><span className="sample-checkbox" /><div><strong>Make sense of calculus</strong><small>MATHEMATICS · 11:30 AM</small></div><span className="sample-priority">HIGH</span></div>
              <div className="sample-task"><span className="sample-checkbox" /><div><strong>Put your ideas on paper</strong><small>DESIGN · 02:00 PM</small></div></div>
              <div className="sample-bottom">One thing at a time. <Icon name="arrow" /></div>
            </div>
            <div className="sticky-note"><span>A REMINDER</span><p>Progress,<br /><em>not perfection.</em></p><span className="note-star" aria-hidden="true">✦</span></div>
            <div className="focus-stamp"><Icon name="clock" size={18} /><span>25:00<small>TIME TO FOCUS</small></span></div>
          </div>
        </section>
        <div className="manifesto"><div className="wrap"><span>MADE FOR YOUR NEXT CHAPTER</span><p>A clear plan. A quieter mind. A better study day.</p><span aria-hidden="true">↗</span></div></div>
        <section className="feature-section wrap" id="features">
          <div className="section-intro"><p className="eyebrow">THOUGHTFULLY SIMPLE</p><h2>Everything in its place.<br /><em>Including your head.</em></h2></div>
          <div className="feature-grid">
            <article><div className="feature-top"><Icon name="tasks" size={29} /><span>01</span></div><h3>Know what’s next.</h3><p>Find tasks in seconds. Sort by deadline or priority, and turn a long list into a clear next step.</p></article>
            <article><div className="feature-top"><Icon name="calendar" size={29} /><span>02</span></div><h3>See the bigger picture.</h3><p>A calendar for your deadlines and a home for every subject. Keep the whole semester in view.</p></article>
            <article><div className="feature-top"><Icon name="clock" size={29} /><span>03</span></div><h3>Make time for focus.</h3><p>Pick a task, start a focus session, and take a proper break. Good work needs a little breathing room.</p></article>
          </div>
        </section>
        <section className="how-section wrap" id="how-it-works"><div><p className="eyebrow">NO COMPLICATED ROUTINE REQUIRED</p><h2>Start small.<br />Keep going.</h2></div><ol><li><strong>Write it down.</strong><p>Add a task, its subject, and a deadline.</p></li><li><strong>Make room for it.</strong><p>Check your calendar and choose what matters today.</p></li><li><strong>Enjoy the checkmark.</strong><p>Finish a task and watch your progress grow.</p></li></ol></section>
        <section className="landing-cta wrap"><span className="cta-star" aria-hidden="true">✳</span><div><p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p><h2>Make today a<br /><em>little more yours.</em></h2></div><a className="button button-dark" href="#dashboard">Open your studyspace <Icon name="arrow" /></a></section>
      </main>
      <footer className="landing-footer wrap"><a href="#home" className="brand"><span className="brand-mark">s.</span>studyspace</a><p>Space to plan. Time to grow.</p><a href="#dashboard">Go to planner ↗</a></footer>
    </div>
  )
}
