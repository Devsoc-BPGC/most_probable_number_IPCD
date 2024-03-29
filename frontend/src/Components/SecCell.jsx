import {
  Flex,
  FormControl,
  Input,
  Text,
  Button,
  Divider,
  Image,
  RadioGroup,
  Radio,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export default function SecCell() {
  const [imgs, setImgs] = useState({});
  const [time, setTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [img, setImg] = useState({});
  const [mpns, setMpns] = useState();
  const [metric, setMetric] = useState('hsv');
  const user = JSON.parse(localStorage.getItem('user'));

  const dispImgs = i => {
    const keys = Object.keys(i);
    keys.sort();
    return keys.map((item, index) => (
      <Image src={i[item]} boxSize={100} key={index} />
    ));
  };

  useEffect(() => {
    if (
      imgs.img0 &&
      imgs.img1 &&
      imgs.img2 &&
      imgs.img3 &&
      imgs.img4 &&
      imgs.img5
    ) {
      console.log(imgs);
      fetch('http://localhost:5000/img', {
        method: 'POST',
        body: JSON.stringify({
          exptmode: 'batch',
          img: imgs.img0, ///add the first link here of the main tray
          test0: imgs.img1,
          test1: imgs.img2,
          test2: imgs.img3,
          test3: imgs.img4,
          test4: imgs.img5,
          metric: metric,
        }),
      })
        .then(res => res.text())
        .catch(err => console.log(err))
        .then(data => {
          console.log(data);
          setMpns(data);
          fetch('http://localhost:3001/upload2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              img: imgs.img0,
              test0: imgs.img1,
              test1: imgs.img2,
              test2: imgs.img3,
              test3: imgs.img4,
              test4: imgs.img5,
              googleId: user.googleId,
              mpn: data,
            }),
          });
        });
    }
  }, [user.googleId, imgs]);

  const handleSubmit = () => {
    setIsLoading(true);
    const fD0 = new FormData();
    const fD1 = new FormData();
    const fD2 = new FormData();
    const fD3 = new FormData();
    const fD4 = new FormData();
    const fD5 = new FormData();
    fD0.append('image', img['img0']);
    fD1.append('image', img['img1']);
    fD2.append('image', img['img2']);
    fD3.append('image', img['img3']);
    fD4.append('image', img['img4']);
    fD5.append('image', img['img5']);
    fetch('http://localhost:3001/imageupload', {
      method: 'POST',
      body: fD0,
    })
      .then(res => res.json())
      .then(data => setImgs(imgs => ({ ...imgs, img0: data.imageUrl })));
    fetch('http://localhost:3001/imageupload', {
      method: 'POST',
      body: fD1,
    })
      .then(res => res.json())
      .then(data => setImgs(imgs => ({ ...imgs, img1: data.imageUrl })));
    fetch('http://localhost:3001/imageupload', {
      method: 'POST',
      body: fD2,
    })
      .then(res => res.json())
      .then(data => setImgs(imgs => ({ ...imgs, img2: data.imageUrl })));
    fetch('http://localhost:3001/imageupload', {
      method: 'POST',
      body: fD3,
    })
      .then(res => res.json())
      .then(data => setImgs(imgs => ({ ...imgs, img3: data.imageUrl })));
    fetch('http://localhost:3001/imageupload', {
      method: 'POST',
      body: fD4,
    })
      .then(res => res.json())
      .then(data => setImgs(imgs => ({ ...imgs, img4: data.imageUrl })));
    fetch('http://localhost:3001/imageupload', {
      method: 'POST',
      body: fD5,
    })
      .then(res => res.json())
      .then(data => {
        setImgs(imgs => ({ ...imgs, img5: data.imageUrl }));
        setIsLoading(false);
      });
  };
  return (
    <>
      <Flex>
        <Flex direction={'column'} p={'2%'}>
          <Text fontSize={'xl'} p='1%'>
            Upload images
          </Text>
          <FormControl p='1%'>
            <Input
              id='time'
              placeholder='Select date and time'
              type='datetime-local'
              size={'md'}
              onChange={e => {
                setTime(new Date(e.target.value));
              }}
            />
          </FormControl>
          <FormControl p='1%'>
            <Input
              id='img0'
              placeholder='Upload image'
              type='file'
              accept='image/*'
              size={'md'}
              onChange={e => {
                setImg(i => ({ ...i, img0: e.target.files[0] }));
              }}
            />
          </FormControl>
          <FormControl p='1%'>
            <Input
              id='img1'
              placeholder='Upload image'
              type='file'
              accept='image/*'
              size={'md'}
              onChange={e => {
                setImg(i => ({ ...i, img1: e.target.files[0] }));
              }}
            />
          </FormControl>
          <FormControl p='1%'>
            <Input
              id='img2'
              placeholder='Upload image'
              type='file'
              accept='image/*'
              size={'md'}
              onChange={e => {
                setImg(i => ({ ...i, img2: e.target.files[0] }));
              }}
            />
          </FormControl>
          <FormControl p='1%'>
            <Input
              id='img3'
              placeholder='Upload image'
              type='file'
              accept='image/*'
              size={'md'}
              onChange={e => {
                setImg(i => ({ ...i, img3: e.target.files[0] }));
              }}
            />
          </FormControl>
          <FormControl p='1%'>
            <Input
              id='img4'
              placeholder='Upload image'
              type='file'
              accept='image/*'
              size={'md'}
              onChange={e => {
                setImg(i => ({ ...i, img4: e.target.files[0] }));
              }}
            />
          </FormControl>
          <FormControl p='1%'>
            <Input
              id='img5'
              placeholder='Upload image'
              type='file'
              accept='image/*'
              size={'md'}
              onChange={e => {
                setImg(i => ({ ...i, img5: e.target.files[0] }));
              }}
            />
          </FormControl>
          <RadioGroup onChange={setMetric} value={metric} p={'1%'}>
            <Radio value='hsv' marginRight={'2%'}>
              HSV
            </Radio>
            <Radio value='delta'>Delta E</Radio>
          </RadioGroup>
          <Flex justifyContent={'end'} p='2%'>
            <Button
              colorScheme='blue'
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              Submit
            </Button>
          </Flex>
        </Flex>
        <Divider
          orientation='vertical'
          borderWidth={'1.5px'}
          borderColor={'black'}
          height={'auto'}
        />
        <Flex
          direction={'column'}
          alignItems={'center'}
          justifyContent={'space-evenly'}
          width={'100%'}
        >
          {imgs.img5 && time ? (
            <>
              <Flex direction={'column'} textAlign={'center'}>
                <Flex>
                  {
                    /* {Object.values(imgs).map((item, i) => (
                    <Image src={item} boxSize={100} key={i} />
                  ))} */
                    dispImgs(imgs)
                  }
                </Flex>
                <Text fontSize={'xl'}>{time.toDateString()}</Text>
              </Flex>
              {mpns ? (
                <Text fontSize={'6xl'}>
                  {mpns
                    .replaceAll('greater than ', '')
                    .replaceAll('less than', '')}
                </Text>
              ) : (
                <></>
              )}
            </>
          ) : (
            <></>
          )}
        </Flex>
      </Flex>
      <Divider
        orientation='horizontal'
        borderWidth={'1.5px'}
        borderColor={'black'}
      />
    </>
  );
}
