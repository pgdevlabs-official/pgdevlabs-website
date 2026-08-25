export function MeshBackground() {
  return (
    <div className="mesh-bg">
      <div
        className="mesh-orb mesh-orb-1"
        style={{
          width: 420,
          height: 420,
          top: "-10%",
          left: "5%",
          background: "radial-gradient(circle, rgba(91,141,239,0.9), transparent 70%)",
        }}
      />
      <div
        className="mesh-orb mesh-orb-2"
        style={{
          width: 380,
          height: 380,
          top: "10%",
          right: "0%",
          background: "radial-gradient(circle, rgba(255,95,168,0.8), transparent 70%)",
        }}
      />
      <div
        className="mesh-orb mesh-orb-3"
        style={{
          width: 340,
          height: 340,
          bottom: "-15%",
          left: "30%",
          background: "radial-gradient(circle, rgba(123,224,173,0.8), transparent 70%)",
        }}
      />
      <div className="grid-texture absolute inset-0" />
    </div>
  );
}