import axios from 'axios';
import { uploadGoogle } from "@/lib/google";
import {downloadFileToBuffer} from "@/lib/utils"

export const messageApiRequest = async (messages, genre, botName = '') => {
  const options = {
    method: 'POST',
    url: 'https://adult-gpt.p.rapidapi.com/adultgpt',
    headers: {
      'x-rapidapi-key': process.env.CHAT_RAPID_API_KEY,
      'x-rapidapi-host': 'adult-gpt.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: {
      messages: messages,
      genere: genre,
      bot_name: botName,
      temperature: 0.9,
      top_k: 10,
      top_p: 0.9,
      max_tokens: 100
    }
  };

  try {
    const response = await axios.request(options);
    return response.data
  } catch (error) {
    console.error(error);
  }
}

export const swapFaceApiRequest = async (target_url, swap_url) => {
  const data = new FormData();
  data.append('target_url', target_url);
  data.append('swap_url', swap_url);

  const options = {
    method: 'POST',
    url: 'https://faceswap3.p.rapidapi.com/faceswap/v1/image',
    headers: {
      'x-rapidapi-key': process.env.IMG_RAPID_API_KEY,
      'x-rapidapi-host': 'faceswap3.p.rapidapi.com'
    },
    data: data
  };

  try {
    const response = await axios.request(options);
    const data = new FormData();
    data.append('request_id', response.data.image_process_response.request_id);

    while (response.data && response.data.image_process_response.status === "OK") {
      let res = await axios.request({
        method: 'POST',
        url: 'https://faceswap3.p.rapidapi.com/result/',
        headers: {
          'x-rapidapi-key': process.env.IMG_RAPID_API_KEY,
          'x-rapidapi-host': 'faceswap3.p.rapidapi.com'
        },
        data: data
      })
      if (res.data?.image_process_response?.result_url) {
        return res.data.image_process_response.result_url
      }
      if (res.data?.image_process_response?.status === "Error") break
    }
  } catch (error) {
    console.error(error);
  }
}

export const imageApiRequest = async (prompt, genre) => {
  let appendix_text = ""
  let style = "photorealism"
  switch (genre) {
    case "ai-bf-1":
      appendix_text = ". You are my boyfriend"
      break;
    case "ai-gf-1":
    case "ai-gf-2":
      appendix_text = ". You are my girlfriend"
      break;
    case "ai-hen-rei_suz":
      appendix_text = ". You are an anime friend"
      style = "anime"
      break;
    case "ai-gay-1":
      appendix_text = ". You are my gay friend"
      break;
    case "ai-lesbian-1":
      appendix_text = ". You are my lesbian friend"
      break;
    default:
    // Default case code
  }
  const options = {
    method: 'POST',
    url: 'https://api.getimg.ai/v1/essential-v2/text-to-image',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.GETIMG_API_KEY}`
    },
    data: {
      style: style,
      prompt: prompt + appendix_text,
      response_format: 'url',
      output_format: 'jpeg'
    }
  };
  try {
    const response = await axios.request(options)
    console.log(response.data);
    return response.data
  }
  catch (error) {
    console.error(error);
  };
}

export const requestSwapImageApiRequest = async (prompt, genre, profileUrl) => {
  let newImage = await imageApiRequest(prompt, genre)
  const fileBuffer = await downloadFileToBuffer(newImage.url)
  const newImageUrl = await uploadGoogle(fileBuffer)
  let swappedImage = await swapFaceApiRequest(newImageUrl, profileUrl)
  return swappedImage;
}