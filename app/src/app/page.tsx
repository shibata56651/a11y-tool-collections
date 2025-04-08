'use client'

import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  return (
    <div className={'bg-blue-50 h-screen pt-6'}>
      <div
        className={
          'max-w-4xl mx-auto shadow-md rounded px-8 pt-6 pb-8 mb-4 bg-white'
        }
      >
        <p>
          このリポジトリは実務等でよく使用するレイアウトや機能をサンプルコードとして参照できるようにまとめるリポジトリです。
        </p>
        <div className={'mt-4 mb-4'}>
          <button type='button' onClick={() => router.push('/light-house/')}>
            ・lightHouseAPIを使用したパフォーマンス計測
          </button>
        </div>
        <div className={'mt-4 mb-4'}>
          <button type='button' onClick={() => router.push('/drop-down/')}>
            ・a11y考慮したドロップダウンメニュー
          </button>
        </div>
      </div>
    </div>
  )
}
