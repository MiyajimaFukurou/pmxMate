## デスクトップ右下に .pmxモデル を住まわせたい

.pmx および .vmd は各自で用意してください
```
project-root/
├─ models/
│   └─ your_model.pmx        # 使用したい PMX モデル
└─ motions/
    └─ idle.vmd              # 待機モーション用 VMD
```

また、.env で各ファイルを指定してください
```env
PMX_FILE = models/your_model.pmx
IDLE_VMD = motions/idle.vmd
```

### 賢明な方は Desktop Mate を利用すべきでしょう
