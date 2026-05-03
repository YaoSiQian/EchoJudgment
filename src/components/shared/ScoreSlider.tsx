export function ScoreSlider({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#999', marginBottom: 6 }}>
        <span>1</span>
        <span style={{ color: '#FF2442', fontSize: 16, fontWeight: 700 }}>{value}</span>
        <span>10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: '#FF2442',
          height: 4,
        }}
      />
    </div>
  )
}
