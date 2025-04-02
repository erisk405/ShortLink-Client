import "../components/style.css";
const LoadingEffect = () => {
  return (
    <div className="flex items-center justify-between h-60 w-full">
      <section className="container">
        <div>
          <div>
            <span className="one h6"></span>
            <span className="two h3"></span>
          </div>
        </div>
        <div>
          <div>
            <span className="one h1"></span>
            <span className="two h4"></span>
          </div>
        </div>
        <div>
          <div>
            <span className="one h5"></span>
            <span className="two h2"></span>
          </div>
        </div>
        <h2 className="animate-pulse">Loading...</h2>
      </section>
    </div>
  );
};

export default LoadingEffect;
