import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div>
      <nav>
        <Link href='/'>Home</Link>
        <Link href='/bux'></Link>
        <Link href='/nfts'>NFTs</Link>
        <Link href='/shop'>SHOP</Link>
        <Link href='/poker'>POKER</Link>
        <Link href='/spades'>SPADES</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
}
