export default function Loading() {

  return (

    <div className="loading-screen">

      <div className="coin-stack">

        <img
          src="/supercoin.png"
          className="coin coin1"
          alt=""
        />

        <img
          src="/supercoin.png"
          className="coin coin2"
          alt=""
        />

        <img
          src="/supercoin.png"
          className="coin coin3"
          alt=""
        />

      </div>

      <div className="loading-text">
        Loading Dukaan OS
      </div>

    </div>

  );
}