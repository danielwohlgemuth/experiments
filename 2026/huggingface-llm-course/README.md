# Hugging Face LLM Course

https://huggingface.co/learn/llm-course/chapter1/1

## Available Pipelines

### Text Pipelines
- `text-generation`: Generate text from a prompt.
- `text-classification`: Classify text into predefined categories.
- `summarization`: Create a shorter version of a text while preserving key information.
- `translation`: Translate text from one language to another.
- `zero-shot-classification`: Classify text without prior training on specific labels.
- `feature-extraction`: Extract vector representations of text.

### Image Pipelines
- `image-to-text`: Generate text descriptions of images.
- `image-classification`: Identify objects in an image.
- `object-detection`: Locate and identify objects in images.

### Audio Pipelines
- `automatic-speech-recognition`: Convert speech to text.
- `audio-classification`: Classify audio into categories.
- `text-to-speech`: Convert text to spoken audio.

### Multimodal Pipelines
- `image-text-to-text`: Respond to an image based on a text prompt.

## Types of Transformer Language Models

- **Encoder-only models**: These models use a bidirectional approach to understand context from both directions. Also called auto-encoding models. They're best suited for tasks that require deep understanding of text, such as classification, named entity recognition, and question answering. Examples: BERT, DistilBERT, ModernBERT.
- **Decoder-only models**: These models process text from left to right and are particularly good at text generation tasks. Also called auto-regressive models. They can complete sentences, write essays, or even generate code based on a prompt. Examples: GPT, Llama, Gemma.
- **Encoder-decoder models**: These models combine both approaches, using an encoder to understand the input and a decoder to generate output. Also called sequence-to-sequence models. They excel at sequence-to-sequence tasks like translation, summarization, and question answering. Examples: T5, BART.

## Modern LLM Training Phases

1. **Pretraining**: The model learns to predict the next token on vast amounts of text data.
2. **Instruction tunning**: The model is fine-tuned to follow instructions and generate helpful responses.
