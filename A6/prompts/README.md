# LLM records

The course rules say LLM records must be real runs ("Do not submit invented LLM records"). Every output file here is
the actual answer of the model named in `data/llm.csv`, saved unchanged except for Markdown capture (see each file's header).


| File | Who runs it | Part | Tool |
|---|---|---|---|
| `Dilip_Kumar_Reddy_claude_prompt_01.txt` | Dilip Kumar Reddy | Pattern discovery / application study | Claude Code|
| `Dilip_Kumar_Reddy_prompt_01.txt` | Dilip Kumar Reddy | Pattern discovery | ChatGPT and claude |
| `Sai_Sameer_prompt_01.txt` | Sai Sameer | Evolution CH01 | ChatGPT and Gemini |
| `Sai_Sameer_prompt_02.txt` | Sai Sameer | Cross-language Observer | ChatGPT and Gemini |
| `M_Kumar_prompt_01.txt` | M Kumar | Evolution CH02 |ChatGPT|
| `M_Kumar_prompt_02.txt` | M Kumar | Cross-language State | ChatGPT|
| `K_Harish_prompt_01.txt` | K Harish | Evolution CH03 |ChatGPT|
| `K_Harish_prompt_02.txt` | K Harish | Cross-language Strategy | ChatGPT|
| `S_Leela_Shankar_prompt_01.txt` | S Leela Shankar | Pattern discovery (dataset audit) |ChatGPT|
| `S_Leela_Shankar_prompt_02.txt` | S Leela Shankar | Cross-language metrics |ChatGPT|


| Topic owner | Prompt | Part | Verdict | Verification |
|---|---|---|---|---|
| Dilip Kumar Reddy | `Dilip_Kumar_Reddy_claude_prompt_01.txt` | Application study / pattern discovery (Claude) | partial | `Dilip_Kumar_Reddy_claude_verification_01.md` |
| Dilip Kumar Reddy | `Dilip_Kumar_Reddy_prompt_01.txt` | Pattern discovery | partial | `Dilip_Kumar_Reddy_verification_01.md` |
| Sai Sameer | `Sai_Sameer_prompt_01.txt` | Evolution CH01 | correct (analysis) / partial (design) | `Sai_Sameer_verification_01.md` |
| Sai Sameer | `Sai_Sameer_prompt_02.txt` | Cross-language Observer | partial | `Sai_Sameer_verification_02.md` + `Sai_Sameer_coderun_02.txt` |
| M Kumar | `M_Kumar_prompt_01.txt` | Evolution CH02 | partial | `M_Kumar_verification_01.md` |
| M Kumar | `M_Kumar_prompt_02.txt` | Cross-language State | correct | `M_Kumar_verification_02.md` + `M_Kumar_coderun_02.txt` |
| K Harish | `K_Harish_prompt_01.txt` | Evolution CH03 | partial | `K_Harish_verification_01.md` |
| K Harish | `K_Harish_prompt_02.txt` | Cross-language Strategy | partial | `K_Harish_verification_02.md` + `K_Harish_coderun_02.txt` |
| S Leela Shankar | `S_Leela_Shankar_prompt_01.txt` | Pattern discovery (dataset audit) | correct | `S_Leela_Shankar_verification_01.md` |
| S Leela Shankar | `S_Leela_Shankar_prompt_02.txt` | Cross-language metrics | correct | `S_Leela_Shankar_verification_02.md` |

Each topic owner should read their verification file and sign it (see `HUMAN_VERIFICATION.md`).

## Re-running
`python tools/make_prompt_bundles.py` regenerates the prompt files from `Part1/code`, `Part3/test-cases` and `data/`.
`python tools/run_llm_code.py prompts/<name>_output_02.md <scratch-dir>` recompiles and reruns the generated code.
