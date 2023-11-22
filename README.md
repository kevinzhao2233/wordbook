# 英语学习小工具

用来将一个文章输出为按照词频排序的单词本，并辅以翻译、相关句子。

## TODO

- [x] 写一个简易的输入框，用于获取文章，加一个按钮，用于触发翻译
- [x] 增加翻译功能（暂时只实现有道的接口，[文档](https://ai.youdao.com/DOCSIRMA/html/trans/api/wbfy/index.html)、[JS 示例](https://ai.youdao.com/console/#/service-singleton/text-translation/see-demo?productId=2&id=624)）
- [x] 生成排版（只考虑每一个词语的排版，参考考虫那本小册子，暂时只做小部分，有单词顺序、词频、音标、释义、引用原句子及其翻译就够了）
- [ ] 解析 Markdown、HTML、字幕、解析文件夹
- [ ] 调整请求逻辑，让每次翻译都可以成功
- [ ] 生成目录（按照页数的目录估计实现不了，但是按照单词顺序的目录应该可以。不过排版可能不好做多栏竖排）
- [ ] 将所有转换的过程放到 Worker 里面
- [ ] 可否将常用的词语提前查出来，放到服务器，每次从这里先查一次，查不到就再从供应商那里查。按理说大多数情况下只有句子才需要从供应商查
- [ ] 生成的单词本甚至可以共享出去，如果用 deepl 或者 openAI 翻译的，甚至可以变现（这也算个商业鬼才的想法）