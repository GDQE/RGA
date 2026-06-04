import logo from '../../RGA.png';

export function RGALogo({ size = 44 }) {
  return (
    <img src={logo} width={size} height={size} style={{ objectFit: 'contain' }} />
  );
}
