// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

library Base58 {
  bytes constant prefix1 = hex"0a";
  bytes constant prefix2 = hex"080212";
  bytes constant postfix = hex"18";
  bytes constant sha256MultiHash = hex"1220";
  bytes constant ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  
  /// @dev Converts hex string to base 58
  function toBase58(bytes memory source) internal pure returns (bytes memory) {
    //   function toBytes(uint256 x) returns (bytes b) {
    

    if (source.length == 0) return new bytes(0);
    uint8[] memory digits = new uint8[](64); //TODO: figure out exactly how much is needed
    digits[0] = 0;
    uint8 digitlength = 1;
    for (uint256 i = 0; i<source.length; ++i) {
      uint carry = uint8(source[i]);
      for (uint256 j = 0; j<digitlength; ++j) {
        carry += uint(digits[j]) * 256;
        digits[j] = uint8(carry % 58);
        carry = carry / 58;
      }
      
      while (carry > 0) {
        digits[digitlength] = uint8(carry % 58);
        digitlength++;
        carry = carry / 58;
      }
    }
    //return digits;
    return toAlphabet(reverse(truncate(digits, digitlength)));
  }

  function truncate(uint8[] memory array, uint8 length) internal pure returns (uint8[] memory) {
    uint8[] memory output = new uint8[](length);
    for (uint256 i = 0; i<length; i++) {
        output[i] = array[i];
    }
    return output;
  }
  
  function reverse(uint8[] memory input) internal pure returns (uint8[] memory) {
    uint8[] memory output = new uint8[](input.length);
    for (uint256 i = 0; i<input.length; i++) {
        output[i] = input[input.length-1-i];
    }
    return output;
  }
  
  function toAlphabet(uint8[] memory indices) internal pure returns (bytes memory) {
    bytes memory output = new bytes(indices.length);
    for (uint256 i = 0; i<indices.length; i++) {
        output[i] = ALPHABET[indices[i]];
    }
    return output;
  }
}
contract StoreFront2 is ERC721("MyNFT","TNFT"),ERC721Enumerable{
    uint256 public totalTokens;
    mapping(uint256 => string)private TokenURI;

    mapping(address => uint ) private _balance;
    
    event Buy( address _owner, uint[] _tokens, uint _price );

	using Address for address;
	using Strings for uint;
	using Base58 for bytes;

	mapping(uint => address) private _owners;
	mapping(uint => address) public  creaters;
	mapping(uint => address) private _tokenApprovals;
	mapping(address => mapping(address => bool)) private _operatorApprovals;

	address public immutable signerAddress;
	uint public _totalSupply;
	uint public  maxPerWallet;
	uint public totalSales;
	string private baseUri;

    constructor(){
        signerAddress = 0xaFa52348CeD7B0dA15016096240f6Cd6AE51203c;
        baseUri = "https://ipfs.io/ipfs"; //"https://ipfs.io/ipfs";
        _totalSupply = 1e3;
        maxPerWallet = 1;
	}

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function buy( uint[] memory _tokens, uint _price, bytes memory _signature) public payable {
		uint count = 0;
		require(msg.sender != address(0), "ERC721: mint to the zero address");
		require(verify(_tokens, _price, _signature), "invalid params");
		for (uint k=0; k<_tokens.length; k++) {
	  		uint _tokenId = _tokens[k];
			require(_owners[_tokenId]==address(0),"already minted");
			_owners[_tokenId] = msg.sender;
			creaters[_tokenId] = msg.sender;
			_mint(msg.sender, _tokenId);
			count++;
			_balance[msg.sender]++;
		}
  		require( _balance[msg.sender] <= maxPerWallet, "your wallet reach out limit.");
		uint _amount = count * _price;
		require(msg.value>=_amount, "value is less than total amount");
		uint _remain = msg.value - _amount;
		if (_remain>0) {
			bool sent;                                                             
			bytes memory data;
			(sent, data) = msg.sender.call{value: _remain}("");
		}
		totalSales += count;
		if(totalSales >= 888){
			maxPerWallet = 20;
		}
		emit Buy( msg.sender, _tokens, _price );
	}
    
    function tokenURI(uint tokenId) public view override returns (string memory) {
		bytes memory src = new bytes(32);
    	assembly { mstore(add(src, 32), tokenId) }
		bytes memory dst = new bytes(34);
		dst[0] = 0x12;
		dst[1] = 0x20;
		for(uint i=0; i<32; i++) {
			dst[i + 2] = src[i];
		} 
		return string(abi.encodePacked(baseUri, "/",  dst.toBase58()));
	}

    function totalSupply() public view override returns (uint){
        return _totalSupply;
    }

	function getMessageHash(uint[] memory _tokens, uint _price) public pure returns (bytes32) {
		 return keccak256(abi.encodePacked(_tokens, _price));
	}

	function verify(uint[] memory _tokens, uint _price, bytes memory _signature) public view returns (bool) {
		bytes32 messageHash = getMessageHash(_tokens, _price);
		bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
		return recoverSigner(ethSignedMessageHash, _signature) == signerAddress;
	}
	
	function getEthSignedMessageHash(bytes32 _messageHash) internal pure returns (bytes32) {
		return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
	}

	function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) internal pure returns (address) {
		(bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
		return ecrecover(_ethSignedMessageHash, v, r, s);
	}
	
	function splitSignature(bytes memory sig) internal pure returns (bytes32 r,bytes32 s,uint8 v) {
		require(sig.length == 65, "invalid signature length");
				assembly {
			r := mload(add(sig, 32))
			s := mload(add(sig, 64))
			v := byte(0, mload(add(sig, 96)))
		}
	}
}